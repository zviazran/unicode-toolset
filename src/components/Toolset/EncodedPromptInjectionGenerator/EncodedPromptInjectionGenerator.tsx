import React, { useRef } from "react";
import styles from "./EncodedPromptInjectionGenerator.module.css";
import CounterBar from "../CounterBar";

const EncodedPromptInjectionGenerator: React.FC = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className={styles.encodedPromptInjectionGenerator}>
      <h1>Encoded Prompt Injection Generator</h1>
      <div className={styles.description}>
        <p>Explore how encoded inputs can trick AI systems.</p>
      </div>

      <div className={styles.outputContainer}>
        <textarea className={styles.textBox} ref={textareaRef} />
        <CounterBar textareaRef={textareaRef} />
      </div>
    </div>
  );
};

export default EncodedPromptInjectionGenerator;
