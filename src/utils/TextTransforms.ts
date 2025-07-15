/**
 * Randomly inserts up to changeFraction * codepoint count characters inside the text (never before or after).
 * @param text The original text
 * @param changeFraction A float between 0 and 1 for how many characters to insert
 * @param char The character to insert
 * @returns The new text with insertions
 */
export function addRandomCharacters(chars: string[], changeFraction: number, char: string): string[] {
  if (!chars.length || changeFraction < 0 || chars.length <= 1) return chars;

  const count = chars.length - 1;
  const numToInsert = Math.min(count, Math.max(1, Math.floor(count * changeFraction)));

  const positions = new Set<number>();
  while (positions.size < numToInsert) {
    positions.add(1 + Math.floor(Math.random() * count));
  }

  // insert in reverse order so positions don't shift
  const sortedPositions = Array.from(positions).sort((a, b) => b - a);

  for (const pos of sortedPositions) {
    chars.splice(pos, 0, char);
  }

  return chars;
}
