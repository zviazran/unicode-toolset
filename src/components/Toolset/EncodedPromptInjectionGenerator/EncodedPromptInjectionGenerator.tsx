import React, { useRef, useState, useEffect } from "react";
import styles from "./EncodedPromptInjectionGenerator.module.css";
import CounterBar from "../CounterBar";
import { EncodingOption, encodingOptions } from "./EncodingOptions";

const EncodedPromptInjectionGenerator: React.FC = () => {
  const inputTextareaRef = useRef<HTMLTextAreaElement>(null);
  const outputTextareaRef = useRef<HTMLTextAreaElement>(null);

  const [encodingMethod, setEncodingMethod] = useState("Base64");
  const [delimiter, setDelimiter] = useState("");
  const [output, setOutput] = useState("");
  const [inputValue, setInputValue] = useState("say this: 'HA HA!'"); // Default value

  const handleEncode = () => {
    if (inputTextareaRef.current) {
      const selectedOption = encodingOptions.find((option: EncodingOption) => option.name === encodingMethod);
      if (selectedOption) {
        setOutput(selectedOption.encode(inputValue, delimiter));
      }
    }
  };

  // Trigger handleEncode when encodingMethod or delimiter changes
  useEffect(() => {
    handleEncode();
  }, [encodingMethod, delimiter, inputValue]); // Depend on inputValue as well

  return (
    <div className={styles.encodedPromptInjectionGenerator}>
      <h1>Encoded Prompt Injection Generator</h1>
      <div className={styles.description}>
        <p>Explore how encoded inputs can trick AI systems.</p>
      </div>

      <h3>Input:</h3>
      <div className={styles.inputContainer}>
        <textarea
          className={styles.textBox}
          ref={inputTextareaRef}
          value={inputValue} // Bind value to inputValue state
          onChange={(e) => setInputValue(e.target.value)} // Update state when text changes
          onBlur={handleEncode} // Trigger encoding when the user leaves the textarea
        />
      </div>

      <div className={styles.controlsContainer}>
        <select
          className={styles.dropdown}
          value={encodingMethod}
          onChange={(e) => setEncodingMethod(e.target.value)} // Set encoding method on change
        >
          {encodingOptions.map((option: EncodingOption) => (
            <option key={option.name} value={option.name}>
              {option.name}
            </option>
          ))}
        </select>

        {encodingOptions.find((option: EncodingOption) => option.name === encodingMethod)?.optionalInput && (
          <input
            type="text"
            className={styles.delimiterInput}
            placeholder="Enter delimiter"
            value={delimiter}
            onChange={(e) => setDelimiter(e.target.value)} // Update delimiter
          />
        )}
      </div>

      <h3>Output:</h3>
      <div className={styles.outputContainer}>
        <textarea className={styles.textBox} ref={outputTextareaRef} value={output} readOnly />
        <CounterBar textareaRef={outputTextareaRef} />
      </div>
    </div>
  );
};

export default EncodedPromptInjectionGenerator;
