import React, { useEffect, useState } from "react";
import styles from "./ProcessedTextDisplay.module.css";
import { invisibleCharRanges } from "../CodePointsConsts";

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

      result.push(
        <span
          key={startIndex}
          className={isInvisible ? (isTagChar ? styles.tagChar : styles.invisibleChar) : styles.visibleChar}
          contentEditable
          suppressContentEditableWarning
          data-original={char}
          onClick={(e) => {
            if (!isInvisible) {
              const target = e.currentTarget;
              target.textContent = `U+${codePoint.toString(16).toUpperCase()}`;
              target.className = styles.invisibleChar;
            }
          }}
          onBlur={(e) => handleContentChange(isInvisible, e.target.innerText, startIndex, e.target.dataset.original ?? "")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleContentChange(isInvisible, e.currentTarget.innerText, startIndex, e.currentTarget.dataset.original ?? "");
              e.currentTarget.blur();
            }
          }}
        >
          {isInvisible ? (isTagChar ? String.fromCharCode(codePoint - 0xe0000) : `U+${codePoint.toString(16).toUpperCase()}`) : char}
        </span>
      );
  
      i += char.length;
    }
  
    return result;
  };
  
  

  const handleContentChange = (isInvisible: boolean, newValue: string, position: number, originalValue: string) => {  
    if (!textareaRef.current) return; // Ensure the ref exists
    const currentText = textareaRef.current.value;
    let newContent = "";
    try{
      // If the newContent is a Unicode reference like 'U+FFEF', we want to convert it back to a character.
      if (newValue.startsWith("U+")) {
        const codePoint = parseInt(newValue.slice(2), 16);
        newContent = String.fromCodePoint(codePoint);
        if (!isInvisible && originalValue === newContent) return; // nothing needed to be done
      }
      // Check if the newContent is a single character and is an ASCII character in the range of 0x20 to 0x7F
      if (isInvisible && newValue.length === 1 && newValue.charCodeAt(0) >= 0x20 && newValue.charCodeAt(0) <= 0x7F) {  
        newContent = String.fromCodePoint(newValue.charCodeAt(0) + 0xe0000);
      }
    } catch {}
  
    if (!newContent && newValue === originalValue)
      newContent = newValue;
  
    // Now we can replace the content with the character at the specified position
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
