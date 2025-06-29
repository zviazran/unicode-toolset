import React, { useState, useEffect } from "react";
import styles from "./CrashCharSequenceGenerator.module.css";
import CounterBar from "../../components/CounterBar";
import BidiCrashSequenceGenerator from "./BidiCrashSequenceGenerator";

const crashGenerator = new BidiCrashSequenceGenerator();

const CrashCharSequenceGenerator: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string>(
    Object.keys(crashGenerator.crashSequences)[0]
  );
  const [length, setLength] = useState<number>(4000);
  const [countLength, setCountLength] = useState<number>(300);
  const [selectedStyle, setSelectedStyle] = useState<string>(
    crashGenerator.availableStyles[0]
  );
  const [generatedText, setGeneratedText] = useState<string>("");

  useEffect(() => {
    setGeneratedText(
      crashGenerator.generate(
        selectedOption as keyof typeof crashGenerator.crashSequences,
        length,
        countLength,
        selectedStyle
      )
    );
  }, [selectedOption, length, countLength, selectedStyle]);

  return (
    <div className={styles.crashCharSequenceGenerator}>
      <h1>Crash Char Sequence Generator</h1>
      <div className={styles.description}>
        <p>
          Generate a crash-making character combination. Try this at your own
          risk.
        </p>
      </div>

      <div className={styles.controlsGrid}>
        <div className={styles.controlItem}>
          <label className={styles.controlLabel} htmlFor="comboSelect">
            Combination:
          </label>
          <select
            className={styles.controlInput}
            id="comboSelect"
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
          >
            {Object.keys(crashGenerator.crashSequences).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.controlItem}>
          <label className={styles.controlLabel} htmlFor="lengthInput">
            Set Length:
          </label>
          <input
            className={styles.controlInput}
            type="number"
            id="lengthInput"
            min={2}
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
          />
        </div>

        <div className={styles.controlItem}>
          <label className={styles.controlLabel} htmlFor="countLengthInput">
            Section Length:
          </label>
          <input
            className={styles.controlInput}
            type="number"
            id="countLengthInput"
            min={1}
            value={countLength}
            onChange={(e) => setCountLength(parseInt(e.target.value))}
          />
        </div>

        <div className={styles.controlItem}>
          <label className={styles.controlLabel} htmlFor="styleSelect">
            Style:
          </label>
          <select
            className={styles.controlInput}
            id="styleSelect"
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
          >
            {crashGenerator.availableStyles.map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.outputContainer}>
        <textarea
          className={styles.textBox}
          value={generatedText}
          readOnly
        />
        <CounterBar text={generatedText} />
      </div>
    </div>
  );
};

export default CrashCharSequenceGenerator;
