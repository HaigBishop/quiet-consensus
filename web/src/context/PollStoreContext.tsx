/*
PollStore context for managing poll state across the application.
PollStore is a glorified list of polls that represents the last synced state.
*/

import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { Poll, PollStore } from '../types';

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
}

// Create context
const PollStoreContext = createContext<PollStoreContextType | undefined>(undefined);

// Initial state with example polls
// NOTE: This is temporary - in the future, PollStore will be initialized as empty 
// and refreshPolls() will be called immediately to fetch real data
const createInitialState = (): PollStore => {
  const examplePolls: Poll[] = [
    {
      pollId: "poll-1-biblical-fruit-crossing",
      title: "Which Biblical Fruit Crossing Would You Choose?",
      description: "If you had to cross biblical fruits to create the ultimate divine snack, which combination would be most blessed?",
      creator: "fruitful-disciple-42",
      createdAt: new Date('2025-01-15T10:00:00Z'),
      options: [
        { optionId: "opt-1", text: "Apple of Eden × Pomegranate of Solomon" },
        { optionId: "opt-2", text: "Grapes of Canaan × Figs of Bethany" },
        { optionId: "opt-3", text: "Olives of Gethsemane × Dates of Jericho" }
      ],
      tally: [15, 23, 8],
      metadata: { theme: "biblical-agriculture", humor: "divine" }
    },
    {
      pollId: "poll-2-crossing-red-sea-snacks",
      title: "Best Snack for Crossing the Red Sea?",
      description: "Moses forgot to pack snacks for the 40-year desert journey. What fruit would have made the crossing more bearable?",
      creator: "wandering-foodie-moses",
      createdAt: new Date('2025-01-16T14:30:00Z'),
      options: [
        { optionId: "opt-1", text: "Miracle Manna-infused Melons" },
        { optionId: "opt-2", text: "Staff-blessed Citrus (turns into serpent when needed)" },
        { optionId: "opt-3", text: "Burning Bush Berries (self-heating!)" },
        { optionId: "opt-4", text: "Parted Peaches (split perfectly every time)" }
      ],
      tally: [12, 25, 7, 25],
      metadata: { theme: "biblical-journey", difficulty: "wilderness" }
    },
    {
      pollId: "poll-3-noah-fruit-ark",
      title: "Fruit Species for Noah's Ark 2.0?",
      description: "Noah's building a new ark, but this time it's just for fruit trees. Which crosses should he save for humanity?",
      creator: "8f2b6d97cce113f0a21e4a2dbece7f3b4c0e229b4a78efc1d09f7c3a8e5b6d42",
      createdAt: new Date('2025-01-17T09:15:00Z'),
      options: [
        { optionId: "opt-1", text: "Rainbow Covenant Coconuts × Dove-delivered Olives" },
        { optionId: "opt-2", text: "Two-by-Two Tangerines × Flood-resistant Bananas" },
        { optionId: "opt-3", text: "Ark-sized Avocados × Covenant Cherries" }
      ],
      tally: [31, 18, 22],
      metadata: { theme: "preservation", vessel: "ark", species: "hybrid-fruits" }
    }
  ];

  const pollsMap = examplePolls.reduce((acc, poll) => {
    acc[poll.pollId] = poll;
    return acc;
  }, {} as Record<string, Poll>);

  return {
    polls: pollsMap,
    isLoading: false,
    lastRefresh: new Date()
  };
};

// Provider component
interface PollStoreProviderProps {
  children: ReactNode;
}

export const PollStoreProvider = ({ children }: PollStoreProviderProps) => {
  const [pollStore, dispatch] = useReducer(pollStoreReducer, createInitialState());

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
      // TODO: Replace with actual API call to fetch polls
      // For now, just simulate a network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Polls refreshed.');
    } catch (error) {
      console.error('Failed to refresh polls:', error);
    } finally {
      setLoading(false);
      dispatch({ type: 'SET_LAST_REFRESH', payload: new Date() });
    }
  };

  const value: PollStoreContextType = {
    pollStore,
    dispatch,
    addPoll,
    updatePoll,
    setPolls,
    setLoading,
    refreshPolls
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
