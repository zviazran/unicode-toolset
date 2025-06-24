import { useEffect, useState } from "react";

export type UnicodeEntry = {
  short: string;
  long: string;
  category: string;
  script: string;
};

// shared across all hook users
let cachedUnicodeData: Record<string, UnicodeEntry> | null = null;

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
    return cachedUnicodeData[hex] ?? null;
  };

  return { data, getEntry };
}
