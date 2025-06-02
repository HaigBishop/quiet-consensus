/*
Cryptographic utility functions for generating poll IDs and creator IDs.
*/

/**
 * Generates a SHA-256 hash of the input string
 * @param input - The string to hash
 * @returns Promise resolving to hex-encoded SHA-256 hash
 */
export async function generateSHA256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Generates a random hex string of specified length
 * @param length - The length of the hex string (must be even)
 * @returns Random hex string
 */
export function generateRandomHex(length: number): string {
  if (length % 2 !== 0) {
    throw new Error('Length must be even for hex string');
  }
  
  const array = new Uint8Array(length / 2);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
} 