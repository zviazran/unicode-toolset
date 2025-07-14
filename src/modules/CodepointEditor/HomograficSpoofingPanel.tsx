import React, { useState } from "react";
import useConfusables, { ConfusablesGroups } from "../../hooks/useConfusables";
import styles from "./CodepointEditor.module.css";
import IconSlider from "../../components/IconSlider";
import { Icon } from "@iconify/react";
import RandomCharGenerator from "../../utils/RandomCharGenerator";
import { addRandomCharacters } from "../../utils/TextTransforms";

const options = [
  { value: "addSpaces", label: "Add Spaces" },
  { value: "replaceDifferent", label: "Replace Normalize Different" },
  { value: "replaceSame", label: "Replace Normalize Same" },
];

type HomograficSpoofingPanelProps = {
  setText: (t: string) => void;
  getCurrentText: () => string;
  scrollTargetRef?: React.RefObject<HTMLElement>;
};

export const HomograficSpoofingPanel: React.FC<HomograficSpoofingPanelProps> = ({ setText, getCurrentText }) => {
  const [selectedOption, setSelectedOption] = useState(options[0].value);
  const [chaosLevel, setChaosLevel] = useState(0.5); // 0 = min, 1 = max, 0.5 = middle
  const { getConfusablesGroups } = useConfusables();
  const [lastChangeSummary, setLastChangeSummary] = useState<string>("");

  const handleSpoof = () => {
    const text = getCurrentText();
    if (!text) return;
    let result = text;
    let changes = 0;
    if (selectedOption === "addSpaces") {
      const randomSpace = RandomCharGenerator.getRandomWordBreak();
      result = addRandomCharacters(text, chaosLevel, randomSpace);
      changes = Math.min(text.length, Math.max(1, Math.floor(text.length * chaosLevel)));
    } else if (selectedOption === "replaceDifferent" || selectedOption === "replaceSame") {
      const replaceType = selectedOption === "replaceDifferent" ? "normalizeDifferent" : "normalizeSame";
      const chars = [...text];
      if (chaosLevel < 0.5) {
        const idx = Math.floor(Math.random() * chars.length);
        const groups: ConfusablesGroups = getConfusablesGroups(chars[idx]);
        const candidates = groups[replaceType];
        if (candidates.length > 0) {
          chars[idx] = candidates[Math.floor(Math.random() * candidates.length)];
          changes = 1;
        }
        result = chars.join("");
      } else {
        result = chars.map((c) => {
          const groups: ConfusablesGroups = getConfusablesGroups(c);
          const candidates = groups[replaceType];
          if (candidates.length > 0) {
            changes++;
            return candidates[Math.floor(Math.random() * candidates.length)];
          }
          return c;
        }).join("");
      }
    }
    setText(result);
    setLastChangeSummary(changes > 0 ? `Made ${changes} change${changes !== 1 ? "s" : ""}.` : "No changes made.");
  };

  return (
    <div className={styles.buttonColumn}>
      <select
        value={selectedOption}
        onChange={e => setSelectedOption(e.target.value)}
        style={{ flex: 1 }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <IconSlider
        min={0}
        max={1}
        step={0.01}
        value={chaosLevel}
        onChange={setChaosLevel}
        leftIcon={<Icon icon="mdi:swap-horizontal" width="19" />} 
        rightIcon={<Icon icon="mdi:swap-horizontal-bold" width="20" />} 
        className={styles.slider}
      />
      <button className={styles.charButton} onClick={handleSpoof}>
        Spoof!
      </button>
      {lastChangeSummary && (
        <div className={styles.aiIndicator} style={{ marginTop: 8 }}>{lastChangeSummary}</div>
      )}
    </div>
  );
};
