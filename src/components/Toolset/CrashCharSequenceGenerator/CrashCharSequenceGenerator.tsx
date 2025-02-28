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

      <div className={styles.controlsGrid}>
        <div className={styles.controlItem}>
          <label className={styles.controlLabel} htmlFor="comboSelect">Combination:</label>
          <select className={styles.controlInput} id="comboSelect" value={selectedOption} onChange={handleSelectionChange}>            
            {Object.keys(crashGenerator.crashSequences).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>
        
        <div className={styles.controlItem}>
          <label className={styles.controlLabel} htmlFor="lengthInput">Set Length:</label>
          <input className={styles.controlInput} type="number" id="lengthInput" min={2} value={length} onChange={handleLengthChange} />
        </div>

        <div className={styles.controlItem}>
          <label className={styles.controlLabel} htmlFor="countLengthInput">Section Length:</label>
          <input className={styles.controlInput} type="number" id="countLengthInput" min={1} value={countLength} onChange={handleCountLengthChange} />
        </div>
        
        <div className={styles.controlItem}>
          <label className={styles.controlLabel} htmlFor="styledCheckbox">Styled:</label>
          <input className={styles.controlInput} type="checkbox" id="styledCheckbox" checked={styled} onChange={handleStyledChange} />
        </div>
      </div>

      <div className={styles.outputContainer}>
        <textarea className={styles.textBox} ref={textareaRef} value={generateText()} />
        <CounterBar textareaRef={textareaRef} />
      </div>
    </div>
  );
};

export default CrashCharSequenceGenerator;
