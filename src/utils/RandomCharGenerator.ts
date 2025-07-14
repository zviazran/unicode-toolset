import { invisibleCharRanges, 
  WordBreakWSegSpaceNewlineRegex, 
  DecompositionTypeNoBreakRegex, 
  AIIndicatorRegex 
} from "../constants/CodePointsConsts";

// Compute once at module load
const computeValidRanges = (): [number, number][] => {
  const RandomInvisiblesExcludedRanges = [
    [0x200c, 0x200c],
    [0x202a, 0x202e],
    [0x1d173, 0x1d17a],
    [0xe0000, 0xe01ff],
  ];

  const validRanges: [number, number][] = [];

  for (const [start, end] of invisibleCharRanges) {
    let currentStart = start;
    for (const [exStart, exEnd] of RandomInvisiblesExcludedRanges) {
      if (exEnd < currentStart) continue;
      if (exStart > end) break;
      if (currentStart < exStart) {
        validRanges.push([currentStart, Math.min(end, exStart - 1)]);
      }
      currentStart = Math.max(currentStart, exEnd + 1);
    }
    if (currentStart <= end) {
      validRanges.push([currentStart, end]);
    }
  }
  return validRanges;
};

const validRanges = computeValidRanges();

export const RandomCharGenerator = {
  getRandomCharFromRegex(regex: RegExp): string {
    const cps = new Set<number>();
    const rx = regex.source;
    rx.replace(/\\u\{([0-9a-fA-F]+)\}|\\u([0-9a-fA-F]{4})/g, (_, braced, short) => {
      cps.add(parseInt(braced || short, 16));
      return "";
    });
    rx.replace(/\\u(?:\{)?([0-9a-fA-F]+)(?:\})?-\\u(?:\{)?([0-9a-fA-F]+)(?:\})?/g, (_, a, b) => {
      for (let i = parseInt(a, 16); i <= parseInt(b, 16); i++) cps.add(i);
      return "";
    });
    const list = [...cps];
    const cp = list[Math.floor(Math.random() * list.length)];
    return cp !== undefined ? String.fromCodePoint(cp) : "";
  },

  getRandomWordBreak(): string {
    return this.getRandomCharFromRegex(WordBreakWSegSpaceNewlineRegex);
  },
  getRandomNoBreak(): string {
    return this.getRandomCharFromRegex(DecompositionTypeNoBreakRegex); 
  },
  getRandomInvisibleChar(): string {
    const [start, end] = validRanges[Math.floor(Math.random() * validRanges.length)];
    const codePoint = Math.floor(Math.random() * (end - start + 1)) + start;
    return String.fromCodePoint(codePoint);
  }
};

export default RandomCharGenerator;
