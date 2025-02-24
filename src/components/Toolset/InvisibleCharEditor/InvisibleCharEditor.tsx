// src/components/InvisibleCharEditor.tsx
import React, { useState } from "react";
import styles from './InvisibleCharEditor.module.css';

// Define ranges of invisible characters
const invisibleCharRanges = [
  [0x00ad, 0x00ad], // Soft hyphen
  [0x061c, 0x061c], // Arabic Letter Mark
  [0x180e, 0x180e], // Mongolian vowel separator
  [0x200b, 0x200f], // Zero-width and directional marks
  [0x202a, 0x202e], // Bidirectional text overrides
  [0x2060, 0x206f], // Invisible operators and markers
  [0xfeff, 0xfeff],  // Zero-width no-break space
  [0x1d173, 0x1d17a], // Musical invisible symbols
  [0xe0000, 0xe007f], // Tags
];

// Function to check if a code point is in the invisible ranges
const isInvisibleCodePoint = (code: number): boolean => {
  return invisibleCharRanges.some(([start, end]) => code >= start && code <= end);
};

const replaceInvisibleChars = (text: string): (string | JSX.Element)[] => {
  const result: (string | JSX.Element)[] = [];
  let i = 0;

  while (i < text.length) {
    const codePoint = text.codePointAt(i)!;
    const char = String.fromCodePoint(codePoint);

    if (isInvisibleCodePoint(codePoint)) {
      if (codePoint >= 0xe0020 && codePoint <= 0xe007f) {
        result.push(
          <span key={i} className={styles.tagChar}>
            {String.fromCharCode(codePoint - 0xe0000)}
          </span>
        );
      } else {
        result.push(
          <span key={i} className={styles.invisibleChar}>
            U+{codePoint.toString(16).toUpperCase()}
          </span>
        );
      }
    } else {
      result.push(char);
    }

    i += char.length;
  }

  return result;
};

const InvisibleCharEditor: React.FC = () => {
  const [normalText, setNormalText] = useState("");
  const [processedText, setProcessedText] = useState<(string | JSX.Element)[]>([]);
  const [isTagTyping, setIsAddTagsMode] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;
    const diff = newValue.length - normalText.length;
  
    if (isTagTyping && diff > 0) {
      const insertedText = newValue.slice(cursorPosition - diff, cursorPosition);
  
      // Convert each character to its invisible tag version
      const invisibleText = Array.from(insertedText)
        .filter((char) => /^[a-zA-Z0-9]$/.test(char)) // Only alphanumeric
        .map((char) => String.fromCodePoint(0xe0000 + char.charCodeAt(0)))
        .join("");  

      // Reinsert the processed text at the correct position
      const updatedValue =
        newValue.slice(0, cursorPosition - diff) +
        invisibleText +
        newValue.slice(cursorPosition);
  
      // Update state with the new value
      setNormalText(updatedValue);
      setProcessedText(replaceInvisibleChars(updatedValue));

      // Adjust cursor position to after the processed text
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = cursorPosition - diff + invisibleText.length;
      }, 0);
    } else {
      // Handle deletions or no changes
      setNormalText(newValue);
      setProcessedText(replaceInvisibleChars(newValue));
    }
  };

  const getRandomInvisibleChar = (): string => {
    const excludedRanges = [  
      [0x202a, 0x202e],
      [0x1d173, 0x1d17a],
      [0xe0000, 0xe007f],
    ];

    const validRanges = invisibleCharRanges.filter(([start, end]) =>
      !excludedRanges.some(([exStart, exEnd]) => start >= exStart && end <= exEnd)
    );
  
    const [start, end] = validRanges[Math.floor(Math.random() * validRanges.length)];
    const codePoint = Math.floor(Math.random() * (end - start + 1)) + start;
    
    return String.fromCodePoint(codePoint);
  };
  
  const handleAddInvisibleChars = () => {
    const randomChar = getRandomInvisibleChar();

    const randomPosition = Math.floor(Math.random() * (normalText.length + 1));
    const updatedText = normalText.slice(0, randomPosition) + randomChar + normalText.slice(randomPosition);

    setNormalText(updatedText);
    setProcessedText(replaceInvisibleChars(updatedText));
  };

  const characterCount = normalText.length;
  const byteCount = new TextEncoder().encode(normalText).length;

  return (
    <div className={styles.invisibleCharEditor}>
      <h1>Invisible Characters Editor</h1>
      <div className={styles.description}>
        <p>Online tool to display and add invisible characters to text.</p>
      </div>
      <div className={styles.editor}>
        <div className={styles.textBox}>
          <h2>What we see</h2>
          <textarea
            value={normalText}
            onChange={handleTextChange}
            placeholder="Type your text here..."
          />
        </div>
        <div className={styles.textBox}>
          <h2>What the computer sees</h2>
          <div className={styles.processedText}>
            {processedText}
          </div>
        </div>
      </div>
      <div className={styles.counters}>
        <p>{characterCount} characters, {byteCount} bytes</p>
      </div>
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
      <div className={styles.buttonContainer}>
        <button onClick={handleAddInvisibleChars} className={styles.invisibleCharButton}>
          Add Random Invisible Character
        </button>
      </div>
    </div>
  );
};

export default InvisibleCharEditor;
