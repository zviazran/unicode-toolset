import { useEffect, useState } from "react";

export type UnicodeEntry = {
  short: string;
  long: string;
  category: string;
  script: string;
};

let cachedUnicodeData: Record<string, UnicodeEntry> | null = null;


// Define fallback ranges and script guessing
type FallbackRange = {
  start: number;
  end: number;
  script: string;
  category: string;
  labelPrefix: string; // e.g. "CJK UNIFIED IDEOGRAPH"
};

const FALLBACK_RANGES: FallbackRange[] = [
  { start: 0x4E00, end: 0x9FFF, script: "Han", category: "Lo", labelPrefix: "CJK UNIFIED IDEOGRAPH" },
  { start: 0x3400, end: 0x4DBF, script: "Han", category: "Lo", labelPrefix: "CJK EXTENSION A" },
  { start: 0x20000, end: 0x2A6DF, script: "Han", category: "Lo", labelPrefix: "CJK EXTENSION B" },
  { start: 0xAC00, end: 0xD7AF, script: "Hangul", category: "Lo", labelPrefix: "HANGUL SYLLABLE" },
  { start: 0x3040, end: 0x309F, script: "Hiragana", category: "Lo", labelPrefix: "HIRAGANA" },
  { start: 0x30A0, end: 0x30FF, script: "Katakana", category: "Lo", labelPrefix: "KATAKANA" },
  { start: 0x17000, end: 0x187FF, script: "Tangut", category: "Lo", labelPrefix: "TANGUT CHARACTER" },
  { start: 0x18B00, end: 0x18CFF, script: "Khitan Small Script", category: "Lo", labelPrefix: "KHITAN CHARACTER" },
  { start: 0x1B170, end: 0x1B2FF, script: "Nushu", category: "Lo", labelPrefix: "NUSHU CHARACTER" },
];

// Helper to find fallback
function getFallbackEntry(codePoint: number): UnicodeEntry | null {
  for (const range of FALLBACK_RANGES) {
    if (codePoint >= range.start && codePoint <= range.end) {
      const hex = codePoint.toString(16).toUpperCase();
      return {
        short: range.labelPrefix.split(" ")[0], // e.g. "CJK"
        long: `${range.labelPrefix}-${hex}`,
        category: range.category,
        script: range.script
      };
    }
  }
  return null;
}


export default function useUnicodeData() {
  const [data, setData] = useState<Record<string, UnicodeEntry> | null>(cachedUnicodeData);

  useEffect(() => {
    if (!cachedUnicodeData) {
      fetch(`${import.meta.env.BASE_URL}unicode-min.json`)
        .then((res) => res.json())
        .then((json) => {
          cachedUnicodeData = json;
          setData(json);
        });
    }
  }, []);

  const getEntry = (codePoint: number): UnicodeEntry | null => {
    if (!cachedUnicodeData) return null;

    const hex = codePoint.toString(16).toUpperCase().padStart(4, "0");
    const directEntry = cachedUnicodeData[hex];
    if (directEntry) return directEntry;

    return getFallbackEntry(codePoint);
  };

  return { data, getEntry };
}
