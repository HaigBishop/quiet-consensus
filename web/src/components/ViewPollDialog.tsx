/*
ViewPollDialog component for displaying poll details, voting interface, and results.
Shows as a modal overlay that can be closed by clicking X or outside the dialog.
*/

import { useState, useEffect } from 'react';
import type { Poll } from '../types';
import { usePollStore } from '../context/PollStoreContext';
import './ViewPollDialog.css';

interface ViewPollDialogProps {
  poll: Poll | null;
  isOpen: boolean;
  onClose: () => void;
}

const ViewPollDialog = ({ poll: initialPoll, isOpen, onClose }: ViewPollDialogProps) => {
  const [showResults, setShowResults] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [userVote, setUserVote] = useState<number | null>(null);
  const [votingError, setVotingError] = useState<string | null>(null);
  const { pollStore, refreshPolls, secretJsFunctions } = usePollStore();

  // Get the latest poll data from the store, falling back to the initial poll
  const poll = initialPoll ? pollStore.polls[initialPoll.pollId] || initialPoll : null;

  // Reset state when dialog opens/closes or poll changes
  useEffect(() => {
    if (isOpen && poll) {
      // Always reset state first when opening a poll
      setShowResults(false);
      setHoveredOption(null);
      setIsVoting(false);
      setUserVote(null);
      setVotingError(null);
      
      // Then check if user has already voted (async)
      const checkVote = async () => {
        try {
          const vote = await secretJsFunctions.getMyVote(poll.pollId);
          if (vote !== null) {
            setUserVote(vote);
            setShowResults(true);
          }
        } catch (error) {
          // User hasn't voted or error checking vote
          console.log('Error checking user vote:', error);
        }
      };
      
      checkVote();
    } else if (!isOpen) {
      // Reset state when dialog closes
      setShowResults(false);
      setHoveredOption(null);
      setIsVoting(false);
      setUserVote(null);
      setVotingError(null);
    }
  }, [isOpen, poll?.pollId]);

  // Immediately reset state when poll ID changes (switching between polls)
  useEffect(() => {
    if (poll?.pollId) {
      setShowResults(false);
      setHoveredOption(null);
      setIsVoting(false);
      setUserVote(null);
      setVotingError(null);
    }
  }, [poll?.pollId]);

  // Update local state when poll data changes (from store updates)
  useEffect(() => {
    if (poll && userVote !== null) {
      // If we have a user vote, keep showing results
      setShowResults(true);
    }
  }, [poll, userVote]);

  // const checkUserVote = async () => {
  //   if (!poll) return;
    
  //   try {
  //     const vote = await secretJsFunctions.getMyVote(poll.pollId);
  //     if (vote !== null) {
  //       setUserVote(vote);
  //       setShowResults(true);
  //     }
  //   } catch (error) {
  //     // User hasn't voted or error checking vote
  //     console.log('Error checking user vote:', error);
  //   }
  // };

  if (!isOpen || !poll) return null;

  const handleVote = async (optionId: string) => {
    const optionIndex = poll.options.findIndex(opt => opt.optionId === optionId);
    if (optionIndex === -1) return;

    setIsVoting(true);
    setVotingError(null);
    
    try {
      // Submit vote to blockchain
      await secretJsFunctions.castVote(poll.pollId, optionIndex);
      
      console.log(`Voted for option ${optionIndex} in poll ${poll.pollId}`);
      
      // Refresh polls to get updated tally
      await refreshPolls();
      
      // Verify that the vote was actually recorded by checking user's vote
      const recordedVote = await secretJsFunctions.getMyVote(poll.pollId);
      
      if (recordedVote === optionIndex) {
        // Vote was successfully recorded, update UI
        setUserVote(optionIndex);
        setShowResults(true);
        console.log(`Vote successfully recorded for option ${optionIndex}`);
      } else {
        // Vote was not recorded (likely due to SCT requirement)
        setVotingError("Voting unsuccessful. A Soulbound Credential Token is required to vote.");
        console.log(`Vote not recorded. Expected: ${optionIndex}, Actual: ${recordedVote}`);
      }
    } catch (error) {
      console.error('Failed to cast vote:', error);
      
      // Check if it's an SCT-related error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.toLowerCase().includes('sct') || 
          errorMessage.toLowerCase().includes('soulbound') ||
          errorMessage.toLowerCase().includes('credential')) {
        setVotingError("Voting unsuccessful. A Soulbound Credential Token is required to vote.");
      } else {
        setVotingError(`Voting unsuccessful: ${errorMessage}`);
      }
    } finally {
      setIsVoting(false);
    }
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
          
          <div className="poll-info">
            <span>Total votes: {totalVotes}</span>
            <span>Created: {poll.createdAt.toLocaleDateString()}</span>
            {userVote !== null && !isVoting && (
              <span className="user-vote-info">You voted: {poll.options[userVote].text}</span>
            )}
          </div>

          {/* Options */}
          <div className="poll-options">
            {poll.options.map((option, index) => (
              <div
                key={option.optionId}
                className={`poll-option ${showResults ? 'results-mode' : ''} ${showResults && winningIndices.includes(index) ? 'winning-option' : ''} ${userVote === index && !isVoting ? 'user-voted' : ''}`}
                onMouseEnter={() => !showResults && !isVoting && setHoveredOption(option.optionId)}
                onMouseLeave={() => !showResults && !isVoting && setHoveredOption(null)}
              >
                {showResults ? (
                  // Results view
                  <div className="option-result">
                    <div className="option-text-result">
                      {option.text}
                      {winningIndices.includes(index) && (
                        <span className="winner-badge">🏆</span>
                      )}
                      {userVote === index && !isVoting && (
                        <span className="voted-badge">✓</span>
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
                    {hoveredOption === option.optionId && !isVoting && (
                      <button 
                        className="vote-button"
                        onClick={() => {
                          setVotingError(null); // Clear any previous error
                          handleVote(option.optionId);
                        }}
                        disabled={isVoting}
                      >
                        Vote
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Show Results button (only in voting mode) */}
            {!showResults && userVote === null && (
              <button 
                className="show-results-button"
                onClick={handleShowResults}
                disabled={isVoting}
              >
                Show Results
              </button>
            )}

            {/* Voting status */}
            {isVoting && (
              <div className="voting-status">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="loading-icon">
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
                Submitting vote...
              </div>
            )}

            {/* Voting error */}
            {votingError && (
              <div className="voting-error">
                {votingError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPollDialog; 