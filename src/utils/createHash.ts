import crypto from 'crypto';

/**
 * Generates a random integer between 0 and the specified maximum value (exclusive).
 * @param max The maximum value (exclusive) for the random integer.
 * @returns A random integer between 0 and the specified maximum value (exclusive).
 */
function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

/**
 * Creates a hash using the specified algorithm, input string, and desired length.
 * @param algo The algorithm to use for hashing. Defaults to 'sha256' if not provided.
 * @param str The input string to be hashed.
 * @param length The desired length of the hash.
 * @returns The generated hash string.
 */
export default function createHash(algo: string, str: string, length: number): string {
  return crypto
    .createHash(algo || 'sha256')
    .update(str + getRandomInt(100))
    .digest('hex')
    .slice(0, length);
}
