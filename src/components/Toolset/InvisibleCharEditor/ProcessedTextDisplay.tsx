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
    let i = 0;

    while (i < text.length) {
      const codePoint = text.codePointAt(i)!;
      const char = String.fromCodePoint(codePoint);

      if (isInvisibleCodePoint(codePoint)) {
        const startIndex = i;
        const isTagChar = codePoint >= 0xe0020 && codePoint <= 0xe007f;
        result.push(
          <span
            key={startIndex}
            className={isTagChar ? styles.tagChar : styles.invisibleChar}
            contentEditable
            suppressContentEditableWarning
            data-original={char}
            onBlur={(e) => handleContentChange(e.target.innerText, startIndex, e.target.dataset.original ?? "")}
          >
            {isTagChar ? String.fromCharCode(codePoint - 0xe0000) : `U+${codePoint.toString(16).toUpperCase()}`}
          </span>
        );
      } else {
        result.push(char);
      }

      i += char.length;
    }

    return result;
  };

  const handleContentChange = (newValue: string, position: number, originalText: string) => {  
    if (!textareaRef.current) return; // Ensure the ref exists
    const currentText = textareaRef.current.value;
    let newContent = "";
    try{
      // If the newContent is a Unicode reference like 'U+FFEF', we want to convert it back to a character.
      if (newValue.startsWith("U+")) {
        const codePoint = parseInt(newValue.slice(2), 16);
        newContent = String.fromCodePoint(codePoint);
        if (originalText === newContent) return; // nothing needed to be done
      }
      // Check if the newContent is a single character and is an ASCII character in the range of 0x20 to 0x7F
      if (newValue.length === 1 && newValue.charCodeAt(0) >= 0x20 && newValue.charCodeAt(0) <= 0x7F) {  
        newContent = String.fromCodePoint(newValue.charCodeAt(0) + 0xe0000);
      }
    } catch {}
  
    // Now we can replace the content with the character (or text) at the specified position
    const beforeChange = currentText.slice(0, position);
    const afterChange = currentText.slice(position + originalText.length);
  
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
