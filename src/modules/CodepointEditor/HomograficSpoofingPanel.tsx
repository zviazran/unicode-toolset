import React, { useState } from "react";
import useConfusables, { ConfusablesGroups } from "../../hooks/useConfusables";
import styles from "./CodepointEditor.module.css";
import IconSlider from "../../components/IconSlider";
import { Icon } from "@iconify/react";
import CodepointChecker from "../../utils/CodepointChecker";
import RandomCharGenerator from "../../utils/RandomCharGenerator";
import { addRandomCharacters } from "../../utils/TextTransforms";

const options = [
  { value: "replaceDifferent", label: "Replace Normalize Different" },
  { value: "replaceSame", label: "Replace Normalize Same" },
  { value: "addThinSpaces", label: "Add Thin Spaces" },
  { value: "addVariationSelectors", label: "Add Variation Selectors" },
];

type HomograficSpoofingPanelProps = {
  setText: (t: string) => void;
  getCurrentText: () => string;
  scrollTargetRef?: React.RefObject<HTMLElement>;
};

export const HomograficSpoofingPanel: React.FC<HomograficSpoofingPanelProps> = ({ setText, getCurrentText }) => {
  const [selectedOption, setSelectedOption] = useState(options[0].value);
  const [chaosLevel, setChaosLevel] = useState(0.5);
  const { getConfusablesGroups } = useConfusables();
  const [lastChangeSummary, setLastChangeSummary] = useState<string>("");

  const handleSpoof = () => {
    const text = getCurrentText();
    if (!text) return;
    let chars = [...text];
    let changes = 0;
    if (selectedOption === "addThinSpaces" || selectedOption === "addVariationSelectors") {
      const randomChar = (selectedOption === "addThinSpaces") ? RandomCharGenerator.getRandomThinWordBreak() : RandomCharGenerator.getRandomVariationSelector();
      chars = addRandomCharacters(chars, chaosLevel, randomChar);
      changes = Math.max(0, chars.length - [...text].length);
    } else if (selectedOption === "replaceDifferent" || selectedOption === "replaceSame") {
      const replaceType = selectedOption === "replaceDifferent" ? "normalizeDifferent" : "normalizeSame";
      const count = chars.length;
      const numToReplace = Math.min(count, Math.max(1, Math.floor(count * chaosLevel)));
      const positions = new Set<number>();
      while (positions.size < numToReplace) {
        positions.add(Math.floor(Math.random() * count));
      }

      for (const idx of positions) {
        if (CodepointChecker.isWordBreakChar(chars[idx])) continue;
        const groups: ConfusablesGroups = getConfusablesGroups(chars[idx]);
        const candidates = groups[replaceType];
        if (candidates.length > 0) {
          chars[idx] = candidates[Math.floor(Math.random() * candidates.length)];
          changes++;
        }
      }
    }
    setText(chars.join(""));
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
        leftIcon={<Icon icon="mdi:swap-horizontal" width="18" />}
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
