import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import styles from './CodepointEditor.module.css';
import CounterBar from '../CounterBar';
import { invisibleCharRanges, WordBreakWSegSpaceNewlineRegex, DecompositionTypeNoBreakRegex } from "../CodePointsConsts";
import ProcessedTextDisplay from "./ProcessedTextDisplay";

// Todo: add an button for sending the text in a link
// Todo: add legend indexing

const computeValidRanges = (): [number, number][] => {
  const RandomInvisiblesExcludedRanges = [  
    [0x200c, 0x200c],
    [0x202a, 0x202e],
    [0x1d173, 0x1d17a],
    [0xe0000, 0xe01ff],
  ];

  const validRanges: [number, number][] = [];

  for (const [start, end] of invisibleCharRanges) {
    let currentStart = start;
    
    for (const [exStart, exEnd] of RandomInvisiblesExcludedRanges) {
      if (exEnd < currentStart) continue; // Skip exclusions that are before our range
      if (exStart > end) break; // No more exclusions affect this range

      if (currentStart < exStart) {
        validRanges.push([currentStart, Math.min(end, exStart - 1)]);
      }

      currentStart = Math.max(currentStart, exEnd + 1);
    }

    if (currentStart <= end) {
      validRanges.push([currentStart, end]);
    }
  }

  return validRanges;
};

const CodepointEditor: React.FC = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [normalText, setNormalText] = useState("");
  const [processedText, setProcessedText] = useState<string>("");
  const [isTagTyping, setIsAddTagsMode] = useState(false);
  const validRanges: [number, number][] = computeValidRanges();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const text = query.get("text") ? decodeURIComponent(query.get("text")!) : "";
    if (text){
      setNormalText(text);
      setProcessedText(text);
    }
  }, []); // Empty dependency array ensures it only runs once on mount

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;
    const diff = newValue.length - normalText.length;
  
    if (isTagTyping && diff > 0) {
      const insertedText = newValue.slice(cursorPosition - diff, cursorPosition);
  
      // Convert each character to its invisible tag version
      const invisibleText = Array.from(insertedText)
        .filter((char) => /^[a-zA-Z0-9 !@#$%^&*()]$/.test(char))
        .map((char) => String.fromCodePoint(0xe0000 + char.charCodeAt(0)))
        .join("");
      // Reinsert the processed text at the correct position
      const updatedValue =
        newValue.slice(0, cursorPosition - diff) +
        invisibleText +
        newValue.slice(cursorPosition);
  
      // Update state with the new value
      setNormalText(updatedValue);
      setProcessedText(updatedValue);

      // Adjust cursor position to after the processed text
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = cursorPosition - diff + invisibleText.length;
      }, 0);
    } else {
      // Handle deletions or no changes
      setNormalText(newValue);
      setProcessedText(newValue);
    }
  };

  const getRandomInvisibleChar = (): string => {
    const [start, end] = validRanges[Math.floor(Math.random() * validRanges.length)];
    const codePoint = Math.floor(Math.random() * (end - start + 1)) + start;
    
    return String.fromCodePoint(codePoint);
  };
  
  function getRandomCharFromRegex(regex: RegExp): string {
    const cps = new Set<number>();
    const rx = regex.source;
  
    rx.replace(/\\u\{([0-9a-fA-F]+)\}|\\u([0-9a-fA-F]{4})/g, (_, braced, short) => {
      cps.add(parseInt(braced || short, 16));
      return "";
    });
  
    rx.replace(/\\u(?:\{)?([0-9a-fA-F]+)(?:\})?-\\u(?:\{)?([0-9a-fA-F]+)(?:\})?/g, (_, a, b) => {
      for (let i = parseInt(a, 16); i <= parseInt(b, 16); i++) cps.add(i);
      return "";
    });
  
    const list = [...cps];
    const cp = list[Math.floor(Math.random() * list.length)];
    return cp !== undefined ? String.fromCodePoint(cp) : "";
  }  

  const handleAddChar = (type: "invisible" | "wordBreak" | "noBreak") => {
    let randomChar = "";
  
    if (type === "invisible") {
      randomChar = getRandomInvisibleChar();
    } else if (type === "wordBreak") {
      randomChar = getRandomCharFromRegex(WordBreakWSegSpaceNewlineRegex);
    } else if (type === "noBreak") {
      randomChar = getRandomCharFromRegex(DecompositionTypeNoBreakRegex);
    }

    // Calculate random position with edge handling
    const chars = [...normalText]; // full Unicode-aware characters
    const insertPos = chars.length > 4
      ? Math.floor(Math.random() * (chars.length - 1)) + 1
      : Math.floor(Math.random() * (chars.length + 1));
    chars.splice(insertPos, 0, randomChar);
    const updatedText = chars.join('');

    setNormalText(updatedText);
    setProcessedText(updatedText);
  };

  return (
    <div className={styles.codepointEditor}>
      <h1>Unseen Characters Editor</h1>
      <div className={styles.description}>
        <p>Inspect and edit text at the codepoint level.</p>
      </div>
      <div className={styles.editor}>
        <div className={styles.textBox}>
          <h2>What we see</h2>
          <textarea className={styles.normalText}
            ref={textareaRef}
            value={normalText}
            onChange={handleTextChange}
            placeholder="Type your text here..."
          />
        </div>
        <div className={styles.textBox}>
          <h2>What the computer sees</h2>
          <ProcessedTextDisplay text={processedText} textareaRef={textareaRef} setText={setNormalText}/>
        </div>
      </div>
      <CounterBar
        textareaRef={textareaRef}
        generateQueryString={() => {
          const text = textareaRef.current?.value || "";
          return text ? `?text=${encodeURIComponent(text)}` : "";
        }}
      />
      <div className={styles.buttonContainer}>
        <label className={styles.tagToggle}>
          <input
            type="checkbox"
            checked={isTagTyping}
            onChange={() => setIsAddTagsMode((prev) => !prev)}
          />
          <span>Tag Typing</span>
        </label>
      </div>
      <div className={styles.buttonColumn}>
        <button onClick={() => handleAddChar("invisible")} className={`${styles.charButton} ${styles.invisibleChar}`}>
          Add Random Invisible Character
        </button>
        <button onClick={() => handleAddChar("wordBreak")} className={`${styles.charButton} ${styles.wordBreakChar}`}>
          Add Random Word-Break Whitespace
        </button>
        <button onClick={() => handleAddChar("noBreak")} className={`${styles.charButton} ${styles.noBreakChar}`}>
          Add Random No-Break Whitespace
        </button>
      </div>
    </div>
  );
};

export default CodepointEditor;
