import React, { useEffect, useState } from "react";
import styles from "./ProcessedTextDisplay.module.css";
import { invisibleCharRanges } from "../CodePointsConsts";

type ProcessedTextDisplayProps = {
  text: string;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
};

const ProcessedTextDisplay: React.FC<ProcessedTextDisplayProps> = ({ text, textareaRef }) => {
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
