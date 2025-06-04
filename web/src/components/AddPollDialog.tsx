/*
AddPollDialog component for creating new polls.
Shows as a modal overlay with form inputs for title, description, and options.
*/

import { useState } from 'react';
import type { Poll, PollOption } from '../types';
import { usePollStore } from '../context/PollStoreContext';
import { generateSHA256, generateRandomHex } from '../utils/cryptoUtils';
import './AddPollDialog.css';

interface AddPollDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddPollDialog = ({ isOpen, onClose }: AddPollDialogProps) => {
  const { addPoll } = usePollStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAddOption = () => {
    if (options.length < 8) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setOptions(['', '']);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!title.trim()) {
      alert('Please enter a poll title');
      return;
    }
    if (!description.trim()) {
      alert('Please enter a poll description');
      return;
    }
    
    const validOptions = options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      alert('Please provide at least 2 options');
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate poll data (PLACEHOLDER)
      const creator = generateRandomHex(64); // 256-bit hex string
      const timestamp = new Date().toISOString();
      const pollId = await generateSHA256(`${creator}${timestamp}${title}`);
      
      const pollOptions: PollOption[] = validOptions.map((text, index) => ({
        optionId: `opt-${index + 1}`,
        text: text.trim()
      }));

      const newPoll: Poll = {
        pollId,
        title: title.trim(),
        description: description.trim(),
        createdAt: new Date(),
        options: pollOptions,
        tally: new Array(pollOptions.length).fill(0),
        metadata: {}
      };

      // TODO: In the future, submit poll to blockchain instead of just adding to store
      addPoll(newPoll);
      
      console.log('Poll created successfully:', newPoll);
      handleClose();
      
    } catch (error) {
      console.error('Failed to create poll:', error);
      alert('Failed to create poll. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canAddOption = options.length < 8;
  const canRemoveOption = options.length > 2;

  return (
    <div className="dialog-overlay" onClick={handleOverlayClick}>
      <div className="poll-dialog add-poll-dialog">
        {/* Header */}
        <div className="dialog-header">
          <h2 className="dialog-title">Create New Poll</h2>
          <button className="close-button" onClick={handleClose} aria-label="Close dialog">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="24" y1="0" x2="0" y2="24" />
              <line x1="0" y1="0" x2="24" y2="24" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="dialog-content">
          <form onSubmit={handleSubmit} className="add-poll-form">
            {/* Title Input */}
            <div className="form-group">
              <label htmlFor="poll-title" className="form-label">Poll Title</label>
              <input
                id="poll-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                placeholder="Enter a concise poll title..."
                maxLength={100}
                required
              />
            </div>

            {/* Description Input */}
            <div className="form-group">
              <label htmlFor="poll-description" className="form-label">Description</label>
              <textarea
                id="poll-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-textarea"
                placeholder="Provide context and details for your poll..."
                maxLength={500}
                rows={3}
                required
              />
            </div>

            {/* Options */}
            <div className="form-group">
              <label className="form-label">
                Poll Options ({options.filter(opt => opt.trim()).length}/8)
              </label>
              <div className="options-container">
                {options.map((option, index) => (
                  <div key={index} className="option-input-group">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="form-input option-input"
                      placeholder={`Option ${index + 1}...`}
                      maxLength={100}
                    />
                    {canRemoveOption && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="remove-option-button"
                        aria-label={`Remove option ${index + 1}`}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="22" y1="2" x2="2" y2="22" />
                          <line x1="2" y1="2" x2="22" y2="22" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}

                {canAddOption && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="add-option-button"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Option
                  </button>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button
                type="submit"
                className={`make-poll-button ${isSubmitting ? 'submitting' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="loading-icon">
                      <path d="M21 12a9 9 0 11-6.219-8.56" />
                    </svg>
                    Creating Poll...
                  </>
                ) : (
                  'Make Poll'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPollDialog; 