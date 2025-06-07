import React, { useMemo, useRef } from "react";
import styles from "./ProcessedTextDisplay.module.css";
import { invisibleCharRanges, WordBreakWSegSpaceNewlineRegex, DecompositionTypeNoBreakRegex, AIIndicatorRegex } from "../CodePointsConsts";

type ProcessedTextDisplayProps = {
  text: string;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  setText: (text: string) => void;
  selectionRange: { start: number; end: number };
  onAnalysisChange?: (hasFindings: boolean) => void;
};

const ProcessedTextDisplay: React.FC<ProcessedTextDisplayProps> = ({ text, textareaRef, setText, selectionRange, onAnalysisChange }) => {
  const longPressTimeout = useRef<number | null>(null);
  const longPressVisualTimeout = useRef<number | null>(null);

  const isInvisibleCodePoint = (code: number): boolean => {
    return invisibleCharRanges.some(([start, end]) => code >= start && code <= end);
  };

  const replaceUnseenChars = (text: string, selectionRange: { start: number; end: number }): (string | JSX.Element)[] => {
    const result: (string | JSX.Element)[] = [];
    let hasFindings = false;

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
        hasFindings = hasFindings || (displayedChar != char) || isAIIndicator;
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
            onPointerDown={(e) => {
              const span = e.currentTarget;
              longPressVisualTimeout.current = setTimeout(() => {
                span.classList.add(styles.holdHint);
                setTimeout(() => span.classList.remove(styles.holdHint), 1000);
              }, 500);
              longPressTimeout.current = setTimeout(() =>
                window.open(`https://util.unicode.org/UnicodeJsps/character.jsp?a=${codePoint.toString(16).toLowerCase()}`, "_blank"), 1500);
            }}
            onPointerUp={() => { clearTimeout(longPressTimeout.current!); clearTimeout(longPressVisualTimeout.current!); }}
            onPointerLeave={() => { clearTimeout(longPressTimeout.current!); clearTimeout(longPressVisualTimeout.current!); }}
            onClick={(e) => {
              if (longPressTimeout.current) {
                clearTimeout(longPressTimeout.current);
                longPressTimeout.current = null;
              }

              const target = e.currentTarget;
              target.textContent = `U+${codePoint.toString(16).toUpperCase()}`;
              target.className = `${styles.styledChar} ${styles.editableChar}`;

              if (!target.contentEditable) {
                const range = document.createRange();
                range.selectNodeContents(target);
                range.collapse(false); // false = move to end

                const sel = window.getSelection();
                sel?.removeAllRanges();
                sel?.addRange(range);
              }
              target.contentEditable = "true";
            }}
            onBlur={(e) => {
              handleContentChange(isInvisible, e.target.innerText, startIndex, e.target.dataset.original ?? "");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.blur();
              }
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

    onAnalysisChange?.(hasFindings);
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
    } catch { }

    if (!newContent && newValue === originalValue)
      newContent = newValue;

    const beforeChange = currentText.slice(0, position);
    const afterChange = currentText.slice(position + originalValue.length);

    const updatedText = beforeChange + newContent + afterChange;

    setText(updatedText);
  };

  const processedText = useMemo(() => replaceUnseenChars(text, selectionRange), [text, selectionRange]);

  return (
    <div className={styles.processedText}>
      {processedText}
    </div>
  );
};

export default ProcessedTextDisplay;
