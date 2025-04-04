import React, { useRef, useState, useEffect } from "react";
import styles from "./UrlTwisterComponent.module.css";
import CounterBar from "../CounterBar";
import { StringTwister, URLTwister } from "string-twister";

const UrlTwisterComponent: React.FC = () => {
  const inputTextareaRef = useRef<HTMLTextAreaElement>(null);
  const outputTextareaRef = useRef<HTMLTextAreaElement>(null);

  const [output, setOutput] = useState("");
  const [inputValue, setInputValue] = useState("https://paypal.com");

  function shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  const alwaysAtEnd = [
    (url: string) => URLTwister.hostAfterExampleURL(url, false, false),
    (url: string) => URLTwister.hostAfterExampleURL(url, true, false),
    (url: string) => URLTwister.hostAfterExampleURL(url, false, true),
    (url: string) => URLTwister.hostAfterExampleURL(url, true, true),
    URLTwister.addRandomFillerToDomain
  ];

  const twistFunctions = [
    URLTwister.addWordsToDomain,
    (url: string) => URLTwister.generate(url, [StringTwister.Typo.charSwap, StringTwister.Typo.addedChar, StringTwister.Typo.missingChar, StringTwister.Typo.repetitions, StringTwister.Typo.replacedChar]),
    (url: string) => URLTwister.generate(url, [StringTwister.Typo.charSwap, StringTwister.Typo.addedChar, StringTwister.Typo.missingChar, StringTwister.Typo.repetitions, StringTwister.Typo.replacedChar]).map((url: string) => URLTwister.addWordsToDomain(url)),
  ];

  const handleTwist = () => {
    try {
      new URL(inputValue);
    } catch (e) {
      setOutput(""); // clear output if not a valid URL
      return;
    }

    const shuffled = shuffle(twistFunctions);
    const allFns = [...shuffled, ...alwaysAtEnd];
  
    const results = allFns.flatMap(fn => {
      const output = fn(inputValue);
      return Array.isArray(output) ? output : [output];
    });
  
    setOutput(results.join("\n"));
  };

  useEffect(() => {
    handleTwist();
  }, [inputValue]);

  return (
    <div className={styles.urlTwisterComponent}>
      <h1>URL Twister</h1>
      <div className={styles.description}>
        <p>Enter a URL to generate tricky spoofing versions. Would you be fooled?</p>
      </div>

      <textarea
        className={styles.urlInput}
        ref={inputTextareaRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleTwist}
      />

      <textarea
        className={styles.textBox}
        ref={outputTextareaRef}
        value={output}
        readOnly
      />
      <CounterBar textareaRef={outputTextareaRef} />
    </div>
  );
};

export default UrlTwisterComponent;
