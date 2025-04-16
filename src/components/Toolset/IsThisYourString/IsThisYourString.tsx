import React, { useRef } from "react";
import styles from "./IsThisYourString.module.css";
import CounterBar from "../CounterBar";


const IsThisYourString: React.FC = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);


  return (
    <div className={styles.isThisYourString}>
      <h1>Is This Your String?</h1>
      <div className={styles.description}>
        <p>Enter your corrupted text and maybe we can reverse the damage. Is one of them your original?</p>
      </div>

      <div className={styles.outputContainer}>
        <textarea className={styles.textBox} ref={textareaRef} onChange={() => {}} />
        <CounterBar textareaRef={textareaRef} />
      </div>
    </div>
  );
};

export default IsThisYourString;
