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

  const handleTextChange = (text: string) => {
    setNormalText(text);
    const processed = replaceInvisibleChars(text);
    setProcessedText(processed);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (isTagTyping && /^[a-zA-Z0-9]$/.test(event.key) && !event.ctrlKey && !event.shiftKey) {
      event.preventDefault();
      const tagChar = String.fromCodePoint(0xe0000 + event.key.charCodeAt(0));
      const textarea = event.currentTarget as HTMLTextAreaElement;
      const cursorPosition = textarea.selectionStart;

      const updatedText =
        normalText.slice(0, cursorPosition) + tagChar + normalText.slice(cursorPosition);

      setNormalText(updatedText);
      setProcessedText(replaceInvisibleChars(updatedText));

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = cursorPosition + tagChar.length;
      }, 0);
    }
  };

  const getRandomInvisibleChars = (count: number): string[] => {
    const chars: string[] = [];
    const excludedRanges = [  
      [0x202a, 0x202e],
      [0x1d173, 0x1d17a],
      [0xe0000, 0xe007f],
    ];

    const validRanges = invisibleCharRanges.filter(([start, end]) =>
      !excludedRanges.some(([exStart, exEnd]) => start >= exStart && end <= exEnd)
    );
  
    for (let i = 0; i < count; i++) {
      const [start, end] = validRanges[Math.floor(Math.random() * validRanges.length)];
      const codePoint = Math.floor(Math.random() * (end - start + 1)) + start;
      chars.push(String.fromCodePoint(codePoint));
    }
  
    return chars;
  };

  const handleAddInvisibleChars = (count: number) => {
    const randomChars = getRandomInvisibleChars(count);
    let updatedText = normalText;
    randomChars.forEach(char => {
      const randomPosition = Math.floor(Math.random() * (updatedText.length + 1));
      updatedText = updatedText.slice(0, randomPosition) + char + updatedText.slice(randomPosition);
    });
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
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={handleKeyPress}
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
        <button onClick={() => handleAddInvisibleChars(1)} className={styles.invisibleCharButton}>
          Add Random Invisible Character
        </button>
      </div>
    </div>
  );
};

export default InvisibleCharEditor;
