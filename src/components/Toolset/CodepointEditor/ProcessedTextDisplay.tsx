import React, { useEffect, useState } from "react";
import styles from "./ProcessedTextDisplay.module.css";
import { invisibleCharRanges, wordBreakCharRegex, whitespaceCharRegex } from "../CodePointsConsts";

type ProcessedTextDisplayProps = {
  text: string;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  setText: (text: string) => void;
};

const ProcessedTextDisplay: React.FC<ProcessedTextDisplayProps> = ({ text, textareaRef, setText }) => {
  const [processedText, setProcessedText] = useState<(string | JSX.Element)[]>([]);

  const isInvisibleCodePoint = (code: number): boolean => {
    return invisibleCharRanges.some(([start, end]) => code >= start && code <= end);
  };

  const replaceInvisibleChars = (text: string): (string | JSX.Element)[] => {
    const result: (string | JSX.Element)[] = [];
  
    for (let i = 0; i < text.length; ) {
      const codePoint = text.codePointAt(i)!;
      const char = String.fromCodePoint(codePoint);
      const startIndex = i;
      const isInvisible = isInvisibleCodePoint(codePoint);
      const isTagChar = codePoint >= 0xe0020 && codePoint <= 0xe007f;
      const isWordBreakChar = wordBreakCharRegex.test(char);
      const isWhitespaceChar = whitespaceCharRegex.test(char);

      const getCharClassName = (isInvisible: boolean, isTagChar: boolean, isWordBreakChar: boolean, isWhitespaceChar: boolean) =>
        `${styles.styledChar} ${
          isWordBreakChar ? styles.wordBreakChar
          : isWhitespaceChar ? styles.whitespaceChar
          : isInvisible ? (isTagChar ? styles.tagChar : styles.invisibleChar)
          : styles.visibleChar
        }`;      
      
      const getDisplayedChar = (char: string, codePoint: number, isInvisible: boolean, isTagChar: boolean, isWordBreakChar: boolean, isWhitespaceChar: boolean) => 
        isInvisible || isWordBreakChar || isWhitespaceChar ? isTagChar ? String.fromCharCode(codePoint - 0xe0000) : (codePoint === 0x20) ? char : `U+${codePoint.toString(16).toUpperCase()}` : char;

      if (codePoint === 0x0D || codePoint === 0x0A) {
        if (codePoint === 0x0D && i + 1 < text.length && text.codePointAt(i + 1) === 0x0A) {
          i++; 
        }
        result.push(<br key={startIndex} />);
      } else {
        result.push(
          <span
            key={startIndex}
            className={getCharClassName(isInvisible, isTagChar, isWordBreakChar, isWhitespaceChar)}
            contentEditable
            suppressContentEditableWarning
            data-original={char}
            title={`U+${codePoint.toString(16).toUpperCase()}`}
            onClick={(e) => {
              const target = e.currentTarget;
              target.textContent = `U+${codePoint.toString(16).toUpperCase()}`;
              target.className = `${styles.styledChar} ${styles.editableChar}`;
            }}
            onBlur={(e) => {
              handleContentChange(isInvisible, e.target.innerText, startIndex, e.target.dataset.original ?? "");
                const originalChar = e.target.dataset.original ?? "";
                e.target.textContent = getDisplayedChar(originalChar, codePoint, isInvisible, isTagChar, isWordBreakChar, isWhitespaceChar);
                e.target.className = getCharClassName(isInvisible, isTagChar, isWordBreakChar, isWhitespaceChar);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleContentChange(isInvisible, e.currentTarget.innerText, startIndex, e.currentTarget.dataset.original ?? "");
                e.currentTarget.blur();
              }
            }}
          >
            {getDisplayedChar(char, codePoint, isInvisible, isTagChar, isWordBreakChar, isWhitespaceChar)}
          </span>
        );
      }
  
      i += char.length;
    }
  
    return result;
  };
  
  const handleContentChange = (isInvisible: boolean, newValue: string, position: number, originalValue: string) => {  
    if (!textareaRef.current) return;
    const currentText = textareaRef.current.value;
    let newContent = "";
    try {
      if (newValue.startsWith("U+")) {
        const codePoint = parseInt(newValue.slice(2), 16);
        newContent = String.fromCodePoint(codePoint);
        if (!isInvisible && originalValue === newContent) return;
      }
      if (isInvisible && newValue.length === 1 && newValue.charCodeAt(0) >= 0x20 && newValue.charCodeAt(0) <= 0x7F) {  
        newContent = String.fromCodePoint(newValue.charCodeAt(0) + 0xe0000);
      }
    } catch {}
  
    if (!newContent && newValue === originalValue)
      newContent = newValue;
  
    const beforeChange = currentText.slice(0, position);
    const afterChange = currentText.slice(position + originalValue.length);
  
    const updatedText = beforeChange + newContent + afterChange;
  
    setText(updatedText);
    setProcessedText(replaceInvisibleChars(updatedText));
  };
  
  useEffect(() => {
    setProcessedText(replaceInvisibleChars(text));
  }, [text]);

  return (
    <div className={styles.processedText}>
      {processedText}
    </div>
  );
};

export default ProcessedTextDisplay;
