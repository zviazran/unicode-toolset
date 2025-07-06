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
    let combined = directMatches;

    if (directMatches.length === 1 && directMatches[0].length === 1) {
      const additional = cachedConfusablesData[directMatches[0]] || [];
      combined = [...new Set([...directMatches, ...additional])];
    }

    const nfdForm = char.normalize("NFD");
    if (nfdForm.length > 1) {
      const first = nfdForm[0];
      const rest = nfdForm.slice(1);

      const firstConfusables = cachedConfusablesData[first] || [];
      combined = [...combined, ...firstConfusables.map(c => c + rest)];
    }

    return [...new Set(combined)].filter(c => c && c !== char);
  };


  return { data, getConfusablesFor };
}
