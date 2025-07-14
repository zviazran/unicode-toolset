// TextTransforms.ts
/**
 * Randomly inserts up to changeFraction * text.length characters inside the text (never before or after).
 * @param text The original text
 * @param changeFraction A float between 0 and 1 for how many characters to insert
 * @param char The character to insert
 * @returns The new text with insertions
 */
export function addRandomCharacters(text: string, changeFraction: number, char: string): string {
  if (!text || changeFraction < 0 || text.length <= 1) return text;

  const count = text.length - 1; // positions between characters
  const numToInsert = Math.min(count, Math.max(1, Math.floor(count * changeFraction)));

  const positions = new Set<number>();
  while (positions.size < numToInsert) {
    positions.add(1 + Math.floor(Math.random() * count)); // ensures between 1 and length-1
  }

  const sortedPositions = Array.from(positions).sort((a, b) => a - b);

  let result = "";
  let lastIdx = 0;

  for (const pos of sortedPositions) {
    result += text.slice(lastIdx, pos) + char;
    lastIdx = pos;
  }

  result += text.slice(lastIdx);
  return result;
}
