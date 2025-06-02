/*
The main user interface component for Quiet Consensus.
Provides a split-panel layout with polls on the left and options on the right.
*/

import { useState } from 'react';
import './QuiConUI.css';

const QuiConUI = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const handleRefresh = () => {
        // Placeholder for refresh functionality
        console.log('Refreshing polls...');
    };

    const handleAddPoll = () => {
        // Placeholder for add poll functionality
        console.log('Adding new poll...');
    };

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
                        <h2 className="panel-title">Polls</h2>
                        <div className="header-actions">
                            <button 
                                className="icon-button" 
                                onClick={handleRefresh}
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
                        {/* Empty for now - will contain poll cards */}
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuiConUI; 