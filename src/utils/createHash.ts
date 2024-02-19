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
 * @param algo - The hash algorithm to use (e.g., 'md5', 'sha1', 'sha256', 'sha512').
 * @param str - The input string to hash.
 * @param length - The desired length of the hash.
 * @returns The generated hash string.
 * @throws Error if the specified hash algorithm is invalid.
 */
export default function createHash(algo: string, str: string, length: number): string {
  const validHashAlgorithms = ['md5', 'sha1', 'sha256', 'sha512'];

  if (!validHashAlgorithms.includes(algo)) {
    throw new Error(`Invalid hashAlgorithm: ${algo}. Must be one of ${validHashAlgorithms.join(', ')}`);
  }

  return crypto
    .createHash(algo || 'sha256')
    .update(str + getRandomInt(100))
    .digest('hex')
    .slice(0, length);
}
