/**
 * Utility helpers for text transformations.
 *
 * These functions are designed to be Unicode-aware where possible,
 * using grapheme cluster segmentation when available.
 */
const graphemeSegmenter: any = typeof Intl !== "undefined" && (Intl as any).Segmenter
  ? new (Intl as any).Segmenter(undefined, { granularity: "grapheme" })
  : null;

function splitGraphemes(text: string): string[] {
  if (graphemeSegmenter) {
    return Array.from((graphemeSegmenter as any).segment(text), (segment: any) => segment.segment);
  }
  return Array.from(text);
}

/**
 * Randomly inserts the specified character into the array of characters.
 *
 * This function mutates the provided array and inserts `char` at random
 * positions, never at index 0 and never beyond the last index.
 *
 * @param chars Array of characters to mutate
 * @param changeFraction Fraction of positions to insert into (0–1)
 * @param char The character to insert
 * @returns The mutated character array
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

/**
 * Reverse text while preserving grapheme clusters when supported.
 *
 * If `start` and `end` are provided, only the selected substring is reversed.
 * Otherwise the whole string is reversed.
 *
 * @param text The input text to transform
 * @param start Optional start index of the range to reverse
 * @param end Optional end index of the range to reverse
 * @returns The transformed text with the selected region reversed
 */
export function reverseString(text: string, start?: number, end?: number): string {
  if (start === undefined || end === undefined || start === end) {
    return splitGraphemes(text).reverse().join("");
  }

  const normalizedStart = Math.max(0, Math.min(start, text.length));
  const normalizedEnd = Math.max(normalizedStart, Math.min(end, text.length));
  const before = text.slice(0, normalizedStart);
  const selected = splitGraphemes(text.slice(normalizedStart, normalizedEnd)).reverse().join("");
  const after = text.slice(normalizedEnd);
  return before + selected + after;
}
