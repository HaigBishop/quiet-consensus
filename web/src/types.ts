/*
TypeScript data structures for the Quiet Consensus web frontend.
*/

export interface PollOption {
  /** Unique identifier within its poll (e.g. UUID or index) */
  optionId: string;
  /** The text that voters see for this option */
  text: string;
}

export interface Poll {
  /** Unique identifier (SHA-256 of title+options) */
  pollId: string;
  /** Short summary of the poll */
  title: string;
  /** Full question or context */
  description: string;
  /** When the poll was created */
  createdAt: Date;
  /** List of voting options */
  options: PollOption[];
  /** Vote count per option index */
  tally: number[];
  /** Additional metadata as key-value pairs */
  metadata: Record<string, string>;
}

export interface PollStore {
  /** All polls indexed by their ID */
  polls: Record<string, Poll>;
  /** Loading state for poll operations */
  isLoading: boolean;
  /** Last time polls were refreshed */
  lastRefresh?: Date;
}
