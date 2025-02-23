import React, { useState } from "react";
import styles from './DrUnicodeWrapper.module.css';
import { DrUnicode } from 'drunicode';

const DrUnicodeWrapper: React.FC = () => {
  const [normalText, setNormalText] = useState<string>("");  
  const [diagnosisText, setDiagnosisText] = useState<string>("");
  const drUnicode = new DrUnicode();

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNormalText(value);

    const res = drUnicode.analyze(value, (invalidString, message) => {
      if (value == invalidString)
        setDiagnosisText(message);
    });
    if (res === drUnicode.STATUS.VALID)
      setDiagnosisText("");
  };

  return (
    <div className={styles.drUnicodeWrapper}>
      <h1>Dr. Unicode</h1>
      <div className={styles.description}>
        <p>The best doctor around to diagnose your text problems.</p>
      </div>
      <div className={styles.textBox}>
        <textarea
          value={normalText}
          onChange={handleTextChange}
          placeholder="Text input..."
        />
      </div>
      <div className={styles.diagnosisText}>
          {diagnosisText}
      </div>
      <div className={styles.counters}>
        <p>{normalText.length} characters, {new TextEncoder().encode(normalText).length} bytes</p>
      </div>
    </div>
  );
};

export default DrUnicodeWrapper;
