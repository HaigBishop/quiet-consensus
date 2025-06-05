/*
PollStore context for managing poll state across the application.
PollStore is a glorified list of polls that represents the last synced state.
*/

import { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Poll, PollStore } from '../types';
import { SecretJsFunctions } from '../secretjs/SecretJsFunctions';
import { SecretJsContext } from '../secretjs/SecretJsContext';

// Poll refresh frequency in milliseconds (30 seconds)
const POLL_REFRESH_FREQUENCY = 30000;

// Actions for the PollStore reducer
type PollStoreAction = 
  | { type: 'SET_POLLS'; payload: Poll[] }
  | { type: 'ADD_POLL'; payload: Poll }
  | { type: 'UPDATE_POLL'; payload: Poll }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LAST_REFRESH'; payload: Date };

// PollStore reducer
const pollStoreReducer = (state: PollStore, action: PollStoreAction): PollStore => {
  switch (action.type) {
    case 'SET_POLLS':
      const pollsMap = action.payload.reduce((acc, poll) => {
        acc[poll.pollId] = poll;
        return acc;
      }, {} as Record<string, Poll>);
      return {
        ...state,
        polls: pollsMap,
        lastRefresh: new Date()
      };
    case 'ADD_POLL':
      return {
        ...state,
        polls: {
          ...state.polls,
          [action.payload.pollId]: action.payload
        }
      };
    case 'UPDATE_POLL':
      return {
        ...state,
        polls: {
          ...state.polls,
          [action.payload.pollId]: action.payload
        }
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'SET_LAST_REFRESH':
      return {
        ...state,
        lastRefresh: action.payload
      };
    default:
      return state;
  }
};

// Context type
interface PollStoreContextType {
  pollStore: PollStore;
  dispatch: React.Dispatch<PollStoreAction>;
  // Helper functions
  addPoll: (poll: Poll) => void;
  updatePoll: (poll: Poll) => void;
  setPolls: (polls: Poll[]) => void;
  setLoading: (loading: boolean) => void;
  refreshPolls: () => Promise<void>;
  // Secret.js functions
  secretJsFunctions: ReturnType<typeof SecretJsFunctions>;
}

// Create context
const PollStoreContext = createContext<PollStoreContextType | undefined>(undefined);

// Initial state - empty, will be populated from blockchain
const createInitialState = (): PollStore => {
  return {
    polls: {},
    isLoading: false,
    lastRefresh: undefined
  };
};

// Provider component
interface PollStoreProviderProps {
  children: ReactNode;
}

export const PollStoreProvider = ({ children }: PollStoreProviderProps) => {
  const [pollStore, dispatch] = useReducer(pollStoreReducer, createInitialState());
  const secretJsContext = useContext(SecretJsContext);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Call the SecretJsFunctions hook at the component level
  const secretJsFunctions = SecretJsFunctions();

  // Helper functions
  const addPoll = (poll: Poll) => {
    dispatch({ type: 'ADD_POLL', payload: poll });
  };

  const updatePoll = (poll: Poll) => {
    dispatch({ type: 'UPDATE_POLL', payload: poll });
  };

  const setPolls = (polls: Poll[]) => {
    dispatch({ type: 'SET_POLLS', payload: polls });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const refreshPolls = async () => {
    setLoading(true);
    try {
      // Check if wallet is connected
      if (!secretJsContext?.secretJs) {
        console.log('Wallet not connected, skipping poll refresh');
        return;
      }

      const polls = await secretJsFunctions.getPolls();
      console.log('Fetched polls from blockchain:', polls);
      setPolls(polls);
    } catch (error) {
      console.error('Failed to refresh polls:', error);
      // Don't throw - just log the error so the UI doesn't crash
    } finally {
      setLoading(false);
      dispatch({ type: 'SET_LAST_REFRESH', payload: new Date() });
    }
  };

  // Auto-refresh polls when wallet connects
  useEffect(() => {
    if (secretJsContext?.secretJs) {
      refreshPolls();
    }
  }, [secretJsContext?.secretJs]);

  // Set up periodic refresh
  useEffect(() => {
    if (secretJsContext?.secretJs) {
      // Clear any existing interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }

      // Set up new interval for periodic refresh
      refreshIntervalRef.current = setInterval(() => {
        refreshPolls();
      }, POLL_REFRESH_FREQUENCY);

      console.log(`Auto-refresh enabled: polls will refresh every ${POLL_REFRESH_FREQUENCY / 1000} seconds`);
    } else {
      // Clear interval if wallet disconnected
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
        console.log('Auto-refresh disabled: wallet disconnected');
      }
    }

    // Cleanup interval on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [secretJsContext?.secretJs]);

  const value: PollStoreContextType = {
    pollStore,
    dispatch,
    addPoll,
    updatePoll,
    setPolls,
    setLoading,
    refreshPolls,
    secretJsFunctions
  };

  return (
    <PollStoreContext.Provider value={value}>
      {children}
    </PollStoreContext.Provider>
  );
};

// Custom hook to use the PollStore context
export const usePollStore = () => {
  const context = useContext(PollStoreContext);
  if (context === undefined) {
    throw new Error('usePollStore must be used within a PollStoreProvider');
  }
  return context;
};
