import React, { useState } from "react";
import styles from "./CodepointEditor.module.css";
import RandomCharGenerator from "../../utils/RandomCharGenerator";

type NoiseGeneratorPanelProps = {
  setText: (t: string) => void;
  getCurrentText: () => string;
  scrollTargetRef?: React.RefObject<HTMLElement>;
};

export const NoiseGeneratorPanel: React.FC<NoiseGeneratorPanelProps> = ({
  setText,
  getCurrentText,
}) => {
  const [includeRanges, setIncludeRanges] = useState("00A1-202A, 2030-30FF, FE00-FFFF, 1D400-1D7FF, 1F300-1F6FF, 1F900-1FAFF");
  const [count, setCount] = useState(10);
  const [addWordBreaks, setAddWordBreaks] = useState(true);

  const parseRanges = (input: string): [number, number][] => {
    return input
      .split(",")
      .map((r): [number, number] | null => {
        const [startStr, endStr] = r.trim().split("-");
        const start = parseInt(startStr, 16);
        const end = endStr ? parseInt(endStr, 16) : start;
        return isNaN(start) || isNaN(end) ? null : [start, end];
      })
      .filter((x): x is [number, number] => x !== null);
  };

  const handleGenerate = () => {
    const includes = parseRanges(includeRanges);
    const noiseChars: string[] = [];
    let attempts = 0;
    const maxAttempts = count * 20;

    while (noiseChars.length < count && attempts < maxAttempts) {
      const [rangeStart, rangeEnd] = includes[Math.floor(Math.random() * includes.length)];
      const cp = rangeStart + Math.floor(Math.random() * (rangeEnd - rangeStart + 1));
      noiseChars.push(String.fromCodePoint(cp));
      attempts++;
    }

    let noise = noiseChars
      .map((ch) => {
        const insertZWS = addWordBreaks && Math.random() < 0.3; // ~30% chance
        return insertZWS ? ch + RandomCharGenerator.getRandomWordBreak() : ch;
      })
      .join("");

    const insertAt = Math.floor(Math.random() * (noise.length + 1));
    const before = noise.slice(0, insertAt);
    const after = noise.slice(insertAt);
    const newText = before + getCurrentText() + after;

    setText(newText);
  };

  return (
    <div className={styles.buttonColumn}>
      <input
        className={styles.charInput}
        placeholder="Include ranges (e.g. 0020-007F)"
        value={includeRanges}
        onChange={e => setIncludeRanges(e.target.value)}
        style={{ marginBottom: 6, width: "15rem" }}
      />
      <input
        type="number"
        min={1}
        max={1000}
        className={styles.charInput}
        value={count}
        onChange={e => setCount(parseInt(e.target.value, 10))}
        style={{ marginBottom: 6, width: "4rem" }}
      />
      <label className={styles.tagToggle} style={{ marginBottom: 6 }}>
        <input
          type="checkbox"
          checked={addWordBreaks}
          onChange={e => setAddWordBreaks(e.target.checked)}
          style={{ marginTop: 2 }} />
        <span>Random Word Breaks</span>
      </label>
      <button className={styles.charButton} onClick={handleGenerate}>
        Add Noise
      </button>
    </div>
  );
};
