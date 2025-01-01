/**
 * Generates a string of `#` based on the provided level.
 * @param level - The level of the node or element.
 * @returns A string containing the corresponding number of `#` symbols.
 */
export function generateMarkmapHeader(level: number): string {
  if (level <= 0) {
    throw new Error('Level must be a positive integer.');
  }

  return '#'.repeat(level);
}
