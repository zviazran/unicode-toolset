import React, { useState, useRef, useEffect } from "react";
import styles from "./CrashCharSequenceGenerator.module.css";
import CounterBar from "../CounterBar";
import BidiCrashSequenceGenerator from "./BidiCrashSequenceGenerator";

const crashGenerator = new BidiCrashSequenceGenerator(); 

const CrashCharSequenceGenerator: React.FC = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedOption, setSelectedOption] = useState<string>("⚫ LRM+RLM");
  const [length, setLength] = useState<number>(2000);
  const [countLength, setCountLength] = useState<number>(300);
  const [styled, setStyled] = useState<boolean>(true); 

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(e.target.value);
  };

  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLength(parseInt(e.target.value));
  };

  const handleCountLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCountLength(parseInt(e.target.value));
  };

  const handleStyledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStyled(e.target.checked); 
  };

  const generateText = () => {
    return crashGenerator.generate(selectedOption as keyof typeof crashGenerator.crashSequences, length, countLength, styled);
  };

  useEffect(() => {
    setStyled(styled); 
  }, []);

  return (
    <div className={styles.crashCharSequenceGenerator}>
      <h1>Crash Char Sequence Generator</h1>
      <div className={styles.description}>
        <p>Generate a crash-making character combination. Try this at your own risk.</p>
      </div>

      <div className={styles.counterBarContainer}>
        <div className={styles.selectContainer}>
          <label htmlFor="comboSelect">Choose Combination:</label>
          <select id="comboSelect" value={selectedOption} onChange={handleSelectionChange}>
            {Object.keys(crashGenerator.crashSequences).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.inputContainer}>
          <label htmlFor="lengthInput">Set Length:</label>
          <input type="number" id="lengthInput" min={2} value={length} onChange={handleLengthChange} />
        </div>

        <div className={styles.inputContainer}>
          <label htmlFor="countLengthInput">Section Length:</label>
          <input type="number" id="countLengthInput" min={1} value={countLength} onChange={handleCountLengthChange} />
        </div>

        <div className={styles.inputContainer}>
          <label htmlFor="styledCheckbox">Styled Output:</label>
          <input
            type="checkbox"
            id="styledCheckbox"
            checked={styled}
            onChange={handleStyledChange}
          />
        </div>
      </div>

      <div className={styles.counterBarContainer}>
        <div className={styles.textBox}>
          <textarea ref={textareaRef} value={generateText()} />
        </div>
        <CounterBar textareaRef={textareaRef} />
      </div>
    </div>
  );
};

export default CrashCharSequenceGenerator;
