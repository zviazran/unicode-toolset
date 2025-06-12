import React, { useMemo, useEffect, useRef, useState } from "react";
import styles from "./ProcessedTextDisplay.module.css";
import CodepointDialog from "./CodepointDialog";
import { invisibleCharRanges, WordBreakWSegSpaceNewlineRegex, DecompositionTypeNoBreakRegex, AIIndicatorRegex } from "../CodePointsConsts";

type ProcessedTextDisplayProps = {
  text: string;
  setText: (text: string) => void;
  selectionRange: { start: number; end: number };
  onAnalysisChange?: (hasFindings: boolean) => void;
};

const ProcessedTextDisplay: React.FC<ProcessedTextDisplayProps> = ({ text, setText, selectionRange, onAnalysisChange }) => {
  const longPressTimeout = useRef<number | null>(null);
  const longPressVisualTimeout = useRef<number | null>(null);
  const [dialogData, setDialogData] = useState<{
    codePoint: number;
    position: number;
    originalChar: string;
  } | null>(null);
  const isInvisibleCodePoint = (code: number): boolean => {
    return invisibleCharRanges.some(([start, end]) => code >= start && code <= end);
  };

  const replaceUnseenChars = (text: string, selectionRange: { start: number; end: number }, flagCallback?: (hasFinding: boolean) => void): (string | JSX.Element)[] => {
    const result: (string | JSX.Element)[] = [];

    for (let i = 0; i < text.length;) {
      const codePoint = text.codePointAt(i)!;
      const char = String.fromCodePoint(codePoint);
      const startIndex = i;
      const isInvisible = isInvisibleCodePoint(codePoint);
      const isTagChar = codePoint >= 0xe0020 && codePoint <= 0xe007f;
      const isWordBreakChar = WordBreakWSegSpaceNewlineRegex.test(char);
      const isNoBreakChar = DecompositionTypeNoBreakRegex.test(char);
      const isAIIndicator = AIIndicatorRegex.test(char);

      const isSelected = i >= selectionRange.start && i < selectionRange.end;
      const isCursorHere = selectionRange.start === selectionRange.end && selectionRange.start === i;

      const getCharClassName = (isInvisible: boolean, isTagChar: boolean, isWordBreakChar: boolean, isNoBreakChar: boolean, isAIIndicator: boolean) =>
        `${styles.styledChar} ${isWordBreakChar ? styles.wordBreakChar
          : isNoBreakChar ? styles.noBreakChar
            : isInvisible ? (isTagChar ? styles.tagChar : styles.invisibleChar)
              : isAIIndicator ? styles.aiIndicator
                : styles.visibleChar
        }`;

      const getDisplayedChar = (char: string, codePoint: number, isInvisible: boolean, isTagChar: boolean, isWordBreakChar: boolean, isNoBreakChar: boolean) => {
        const displayedChar = isInvisible || isWordBreakChar || isNoBreakChar ? isTagChar ? String.fromCharCode(codePoint - 0xe0000) : (codePoint === 0x20) ? char : `U+${codePoint.toString(16).toUpperCase()}` : char;
        const finding = displayedChar !== char || isAIIndicator;
        if (finding) flagCallback?.(true);
        return displayedChar;
      }

      if (codePoint === 0x0D || codePoint === 0x0A) {
        let title = "";
        if (codePoint === 0x0D && i + 1 < text.length && text.codePointAt(i + 1) === 0x0A) {
          title = "CRLF (\\r\\n)";
          i++; // skip \n part of CRLF
        } else if (codePoint === 0x0D) {
          title = "CR (\\r)";
        } else {
          title = "LF (\\n)";
        }
        result.push(
          <span key={`${startIndex}-${codePoint}`} className={`${styles.styledChar} ${styles.newlineVisual}`} title={title}>
            {isSelected && <span className={styles.selectionOverlay} />}
            {isCursorHere && <span className={styles.cursorBar} />}
            ↵
          </span>);
        result.push(<br key={`${startIndex}-br`} />);
      } else {
        result.push(
          <span
            key={`${startIndex}-${codePoint}`}
            className={getCharClassName(isInvisible, isTagChar, isWordBreakChar, isNoBreakChar, isAIIndicator)}
            contentEditable={false}
            suppressContentEditableWarning
            data-original={char}
            title={`U+${codePoint.toString(16).toUpperCase()}`}
            onPointerUp={() => { clearTimeout(longPressTimeout.current!); clearTimeout(longPressVisualTimeout.current!); }}
            onPointerLeave={() => { clearTimeout(longPressTimeout.current!); clearTimeout(longPressVisualTimeout.current!); }}
            onClick={() => {
              clearTimeout(longPressTimeout.current!);
              setDialogData({
                codePoint,
                position: startIndex,
                originalChar: char,
              });
            }}
          >
            {isSelected && <span className={styles.selectionOverlay} />}
            {isCursorHere && <span className={styles.cursorBar} />}
            {getDisplayedChar(char, codePoint, isInvisible, isTagChar, isWordBreakChar, isNoBreakChar)}
          </span>
        );
      }

      i += char.length;
    }

    if (selectionRange.start === selectionRange.end && selectionRange.start === text.length) {
      result.push(
        <span key="cursor-end" className={styles.styledChar}>
          <span className={styles.cursorBar} />؜
        </span>
      );
    }

    return result;
  };

  const analysisResult = useMemo(() => {
    let findings = false;
    const result = replaceUnseenChars(text, selectionRange, (flag) => {
      findings ||= flag;
    });
    return { result, findings };
  }, [text, selectionRange]);

  useEffect(() => {
    onAnalysisChange?.(analysisResult.findings);
  }, [analysisResult.findings, onAnalysisChange]);

  const processedText = analysisResult.result;


  return (
    <div className={styles.processedText}>
      {processedText}
      {dialogData && (
        <CodepointDialog
          data={dialogData}
          onClose={(newChar) => {
            if (typeof newChar !== 'undefined') {
              const { position, originalChar } = dialogData;
              const before = text.slice(0, position);
              const after = text.slice(position + originalChar.length);
              setText(before + newChar + after);
            }
            setDialogData(null);
          }}
        />
      )}

    </div>
  );
};

export default ProcessedTextDisplay;
