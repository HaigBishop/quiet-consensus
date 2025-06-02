/*
The main user interface component for Quiet Consensus.
Provides a split-panel layout with polls on the left and options on the right.
*/

import { useState } from 'react';
import './QuiConUI.css';
import { usePollStore } from './context/PollStoreContext';
import { formatTimeAgo } from './utils/timeUtils';
import ViewPollDialog from './components/ViewPollDialog';
import AddPollDialog from './components/AddPollDialog';
import type { Poll } from './types';

const QuiConUI = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const { pollStore, refreshPolls } = usePollStore();

    const handleRefresh = async () => {
        await refreshPolls();
    };

    const handleAddPoll = () => {
        setIsAddDialogOpen(true);
    };

    const handlePollClick = (poll: Poll) => {
        setSelectedPoll(poll);
        setIsViewDialogOpen(true);
    };

    const handleCloseViewDialog = () => {
        setIsViewDialogOpen(false);
        setSelectedPoll(null);
    };

    const handleCloseAddDialog = () => {
        setIsAddDialogOpen(false);
    };

    // Convert polls object to array for display
    const pollsArray = Object.values(pollStore.polls);

    return (
        <div className={`quicon-container ${isDarkMode ? 'dark-mode' : ''}`}>
            {/* Top Bar */}
            <div className="top-bar">
                <div className="logo-section">
                    <img src="/icon.png" alt="Quiet Consensus Logo" className="logo" />
                    <span className="app-title">Quiet Consensus</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="main-content">
                {/* Polls Panel (75%) */}
                <div className="polls-panel">
                    <div className="panel-header">
                        <h2 className="panel-title">Polls ({pollsArray.length})</h2>
                        <div className="header-actions">
                            <button 
                                className={`icon-button ${pollStore.isLoading ? 'loading' : ''}`}
                                onClick={handleRefresh}
                                disabled={pollStore.isLoading}
                                aria-label="Refresh polls"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                                </svg>
                            </button>
                            <button 
                                className="icon-button" 
                                onClick={handleAddPoll}
                                aria-label="Add new poll"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="2" x2="12" y2="22" />
                                    <line x1="2" y1="12" x2="22" y2="12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="polls-content">
                        {pollStore.isLoading ? (
                            <div className="loading-message">Loading polls from blockchain...</div>
                        ) : pollsArray.length > 0 ? (
                            <div className="polls-list">
                                {pollsArray.map((poll) => (
                                    <div 
                                        key={poll.pollId} 
                                        className="poll-card"
                                        onClick={() => handlePollClick(poll)}
                                    >
                                        <h3 className="poll-title">{poll.title}</h3>
                                        <p className="poll-description">{poll.description}</p>
                                        <div className="poll-stats">
                                            <span>Options: {poll.options.length}</span>
                                            <span>Votes: {poll.tally.reduce((sum, votes) => sum + votes, 0)}</span>
                                            <span>Created: {poll.createdAt.toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-polls-message">No polls available</div>
                        )}
                    </div>
                </div>

                {/* Options Panel (25%) */}
                <div className="options-panel">
                    <div className="panel-header">
                        <h2 className="panel-title">Options</h2>
                    </div>
                    <div className="options-content">
                        <div className="option-item">
                            <label className="option-label">
                                <span>Dark Mode</span>
                                <input
                                    type="checkbox"
                                    checked={isDarkMode}
                                    onChange={(e) => setIsDarkMode(e.target.checked)}
                                    className="toggle-switch"
                                />
                            </label>
                        </div>
                        {pollStore.lastRefresh && (
                            <div className="option-item">
                                <span className="last-refresh">
                                    Last refresh: {pollStore.lastRefresh.toLocaleTimeString()} ({formatTimeAgo(pollStore.lastRefresh)} ago)
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* View Poll Dialog */}
            <ViewPollDialog
                poll={selectedPoll}
                isOpen={isViewDialogOpen}
                onClose={handleCloseViewDialog}
            />

            {/* Add Poll Dialog */}
            <AddPollDialog
                isOpen={isAddDialogOpen}
                onClose={handleCloseAddDialog}
            />
        </div>
    );
};

export default QuiConUI; 