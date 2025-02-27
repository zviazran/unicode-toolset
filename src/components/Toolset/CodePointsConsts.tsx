// Define ranges of invisible characters
export const invisibleCharRanges = [
  [0x00ad, 0x00ad], // Soft hyphen
  [0x061c, 0x061c], // Arabic Letter Mark
  [0x180e, 0x180e], // Mongolian vowel separator
  [0x200b, 0x200f], // Zero-width and directional marks
  [0x202a, 0x202e], // Bidirectional text overrides
  [0x2060, 0x206f], // Invisible operators and markers
  [0xfeff, 0xfeff],  // Zero-width no-break space
  [0x1d173, 0x1d17a], // Musical invisible symbols
  [0xe0000, 0xe007f], // Tags
];

export const bidiCharacters = new Map<string, number>([
  ["LRE", 0x202A], // LEFT-TO-RIGHT EMBEDDING
  ["RLE", 0x202B], // RIGHT-TO-LEFT EMBEDDING
  ["LRO", 0x202D], // LEFT-TO-RIGHT OVERRIDE
  ["RLO", 0x202E], // RIGHT-TO-LEFT OVERRIDE
  ["PDF", 0x202C], // POP DIRECTIONAL FORMATTING
  ["LRI", 0x2066], // LEFT‑TO‑RIGHT ISOLATE
  ["RLI", 0x2067], // RIGHT‑TO‑LEFT ISOLATE
  ["FSI", 0x2068], // FIRST STRONG ISOLATE
  ["PDI", 0x2069], // POP DIRECTIONAL ISOLATE
  ["LRM", 0x200E], // LEFT-TO-RIGHT MARK
  ["RLM", 0x200F], // RIGHT-TO-LEFT MARK
  ["ALM", 0x061C], // ARABIC LETTER MARK
]);