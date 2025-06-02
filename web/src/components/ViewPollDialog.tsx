/*
ViewPollDialog component for displaying poll details, voting interface, and results.
Shows as a modal overlay that can be closed by clicking X or outside the dialog.
*/

import { useState, useEffect } from 'react';
import type { Poll } from '../types';
import './ViewPollDialog.css';

interface ViewPollDialogProps {
  poll: Poll | null;
  isOpen: boolean;
  onClose: () => void;
}

const ViewPollDialog = ({ poll, isOpen, onClose }: ViewPollDialogProps) => {
  const [showResults, setShowResults] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  // Reset state when dialog opens/closes or poll changes
  useEffect(() => {
    if (isOpen && poll) {
      setShowResults(false);
      setHoveredOption(null);
    }
  }, [isOpen, poll]);

  if (!isOpen || !poll) return null;

  const handleVote = (optionId: string) => {
    // TODO: In the future, submit vote to blockchain here
    console.log(`Voting for option ${optionId} in poll ${poll.pollId}`);
    setShowResults(true);
  };

  const handleShowResults = () => {
    setShowResults(true);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const totalVotes = poll.tally.reduce((sum, votes) => sum + votes, 0);
  
  // Find winning options (options with the highest vote count)
  const maxVotes = Math.max(...poll.tally);
  const hasWinners = maxVotes > 0;
  const winningIndices = hasWinners ? poll.tally.map((votes, index) => votes === maxVotes ? index : -1).filter(index => index !== -1) : [];

  return (
    <div className="dialog-overlay" onClick={handleOverlayClick}>
      <div className="poll-dialog">
        {/* Header */}
        <div className="dialog-header">
          <h2 className="dialog-title">{poll.title}</h2>
          <button className="close-button" onClick={onClose} aria-label="Close dialog">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="24" y1="0" x2="0" y2="24" />
              <line x1="0" y1="0" x2="24" y2="24" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="dialog-content">
          <p className="poll-description-dialog">{poll.description}</p>
          
          <div className="poll-metadata">
            <span>Created by: {poll.creator}</span>
            <span>Total votes: {totalVotes}</span>
            <span>Created: {poll.createdAt.toLocaleDateString()}</span>
          </div>

          {/* Options */}
          <div className="poll-options">
            {poll.options.map((option, index) => (
              <div
                key={option.optionId}
                className={`poll-option ${showResults ? 'results-mode' : ''} ${showResults && winningIndices.includes(index) ? 'winning-option' : ''}`}
                onMouseEnter={() => !showResults && setHoveredOption(option.optionId)}
                onMouseLeave={() => !showResults && setHoveredOption(null)}
              >
                {showResults ? (
                  // Results view
                  <div className="option-result">
                    <div className="option-text-result">
                      {option.text}
                      {winningIndices.includes(index) && (
                        <span className="winner-badge">🏆</span>
                      )}
                    </div>
                    <div className="vote-bar-container">
                      <div 
                        className={`vote-bar ${winningIndices.includes(index) ? 'winning-bar' : ''}`}
                        style={{ 
                          width: totalVotes > 0 ? `${(poll.tally[index] / totalVotes) * 100}%` : '0%' 
                        }}
                      />
                      <span className="vote-count">{poll.tally[index]} votes</span>
                    </div>
                  </div>
                ) : (
                  // Voting view
                  <div className="option-voting">
                    <span className="option-text">{option.text}</span>
                    {hoveredOption === option.optionId && (
                      <button 
                        className="vote-button"
                        onClick={() => handleVote(option.optionId)}
                      >
                        Vote
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Show Results button (only in voting mode) */}
            {!showResults && (
              <button 
                className="show-results-button"
                onClick={handleShowResults}
              >
                Show Results
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPollDialog; 