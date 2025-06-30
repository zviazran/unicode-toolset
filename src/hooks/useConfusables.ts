import { useEffect, useState } from "react";

let cachedConfusablesData: Record<string, string[]> | null = null;

export default function useConfusables() {
  const [data, setData] = useState<Record<string, string[]> | null>(cachedConfusablesData);

  useEffect(() => {
    if (!cachedConfusablesData) {
      fetch(`${import.meta.env.BASE_URL}confusables.json`)
        .then((res) => res.json())
        .then((json) => {
          cachedConfusablesData = json;
          setData(json);
        })
        .catch(console.error);
    }
  }, []);

  const getConfusablesFor = (char: string): string[] => {
    if (!cachedConfusablesData) return [];

    const directMatches = cachedConfusablesData[char] || [];

    // If only one and it's a single char, get its confusables too
    if (directMatches.length === 1 && directMatches[0].length === 1) {
      const additional = cachedConfusablesData[directMatches[0]] || [];
      return [...new Set([...directMatches, ...additional])];
    }

    return directMatches;
  };

  return { data, getConfusablesFor };
}
