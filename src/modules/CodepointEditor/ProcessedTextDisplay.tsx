import React, { useMemo, useEffect, useRef, useState } from "react";
import styles from "./ProcessedTextDisplay.module.css";
import CodepointDialog from "./CodepointDialog";
import { invisibleCharRanges, WordBreakWSegSpaceNewlineRegex, DecompositionTypeNoBreakRegex, AIIndicatorRegex } from "../../constants/CodePointsConsts";
import CollapsibleToolbar from "../../components/CollapsibleToolbar";
import { Icon } from "@iconify/react";
import useUnicodeData from "../../hooks/useUnicodeData";

type ProcessedTextDisplayProps = {
  text: string;
  setText: (text: string) => void;
  selectionRange: { start: number; end: number };
  onAnalysisChange?: (hasFindings: boolean) => void;
  fontFamily?: string;
};

const ProcessedTextDisplay: React.FC<ProcessedTextDisplayProps> = ({ text, setText, selectionRange, onAnalysisChange, fontFamily }) => {
  const processedTextRef = useRef<HTMLDivElement>(null);
  const longPressTimeout = useRef<number | null>(null);
  const longPressVisualTimeout = useRef<number | null>(null);
  const [dialogData, setDialogData] = useState<{
    codePoint: number;
    position: number;
    originalChar: string;
  } | null>(null);
  const [isRtl, setIsRtl] = useState(false);
  const [displayStyle, setDisplayStyle] = useState("U+hex");
  const { getEntry } = useUnicodeData();
  const dottedCircleAllowedScripts = ["Inherited", "Common", "Latin", "Greek", "Cyrillic"];
  const dottedCircleSafeFonts = ["monospace"];

  const toggleDirection = () => {
    setIsRtl((prev) => !prev);
  };

  function getScriptColor(index: number): string {
    if (index === 0) return "undefined";
    const baseHue = 35; // orange
    const saturation = 100;
    const lightness = Math.max(30, 90 - (index - 1) * 8); // from 90% to 30%
    return `hsl(${baseHue}, ${saturation}%, ${lightness}%)`;
  }

  const isInvisibleCodePoint = (code: number): boolean => {
    return invisibleCharRanges.some(([start, end]) => code >= start && code <= end);
  };

  const replaceUnseenChars = (text: string, selectionRange: { start: number; end: number }, flagCallback?: (hasFinding: boolean) => void): (string | JSX.Element)[] => {
    const result: (string | JSX.Element)[] = [];
    const scriptToColor: Record<string, string> = {};
    const shouldOverlayDottedCircle = dottedCircleSafeFonts.some(f => fontFamily?.includes(f));

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
      const script = getEntry(codePoint)?.script ?? "Unknown";

      const getCharClassName = (isInvisible: boolean, isTagChar: boolean, isWordBreakChar: boolean, isNoBreakChar: boolean, isAIIndicator: boolean) =>
        `${styles.styledChar} ${isWordBreakChar ? styles.wordBreakChar
          : isNoBreakChar ? styles.noBreakChar
            : isInvisible ? (isTagChar ? styles.tagChar : styles.invisibleChar)
              : isAIIndicator ? styles.aiIndicator
                : styles.visibleChar
        }`;

      const getDisplayedChar = (char: string, codePoint: number, isInvisible: boolean, isTagChar: boolean, isWordBreakChar: boolean, isNoBreakChar: boolean, isAIIndicator: boolean) => {
        let displayedChar = char;

        if (isInvisible || isWordBreakChar || isNoBreakChar) {
          if (isTagChar) {
            displayedChar = String.fromCharCode(codePoint - 0xe0000);
          } else if (codePoint === 0x20) {
            displayedChar = char;
          } else if (displayStyle === "U+hex") {
            displayedChar = `U+${codePoint.toString(16).toUpperCase()}`;
          } else {
            const entry = getEntry(codePoint);
            displayedChar =
              displayStyle === "Short Name"
                ? entry?.short ?? `U+${codePoint.toString(16).toUpperCase()}`
                : entry?.long ?? `U+${codePoint.toString(16).toUpperCase()}`;
          }
        }

        // combining on dotted circle
        if (shouldOverlayDottedCircle && dottedCircleAllowedScripts.includes(script) && getEntry(codePoint)?.category.startsWith("M")) {
          displayedChar = `${char}\u25CC`;
        }

        const finding = displayedChar !== char || isAIIndicator;
        if (finding) flagCallback?.(true);

        return displayedChar;
      };

      let backgroundColor: string | undefined = undefined;
      const shouldIgnoreScript = (script === "Common" && codePoint < 1000) || script === "Inherited" || script === "Unknown";
      const isStyleTarget = !isInvisible && !isTagChar && !isWordBreakChar && !isNoBreakChar && !isAIIndicator && !shouldIgnoreScript;
      if (isStyleTarget && !(script in scriptToColor)) {
        const nextIndex = Object.keys(scriptToColor).length;
        scriptToColor[script] = getScriptColor(nextIndex);
      }
      if (isStyleTarget) {
        backgroundColor = scriptToColor[script];
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
            style={backgroundColor ? { backgroundColor } : undefined}
            contentEditable={false}
            suppressContentEditableWarning
            data-original={char}
            title={`U+${codePoint.toString(16).toUpperCase()} - ${script}`}
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
            {getDisplayedChar(char, codePoint, isInvisible, isTagChar, isWordBreakChar, isNoBreakChar, isAIIndicator)}
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
  }, [text, selectionRange, displayStyle]);

  useEffect(() => {
    onAnalysisChange?.(analysisResult.findings);
  }, [analysisResult.findings, onAnalysisChange, fontFamily]);

  const processedText = analysisResult.result;


  return (
    <div className={styles.wrapper}>
      <CollapsibleToolbar>
        <button
          onClick={toggleDirection}
          className={styles.toolbarButton}
          style={{ transform: "translateY(-1px)" }}
          title={isRtl ? "Switch to LTR" : "Switch to RTL"}
        >
          <Icon icon={isRtl ? "mdi:rtl" : "mdi:ltr"} className={styles.toolbarIcon} />
        </button>

        <select
          className={styles.toolbarButton}
          style={{ textAlign: "center", padding: 0 }}
          value={displayStyle}
          onChange={(e) => setDisplayStyle(e.target.value)}
          title="display style"
        >
          {['U+hex', 'Short Name', 'Full Name'].map((style) => (
            <option key={style} value={style}>
              {style}
            </option>
          ))}
        </select>

      </CollapsibleToolbar>
      <div ref={processedTextRef} className={`${styles.processedText} ${isRtl ? styles.rtlInput : styles.ltrInput}`} style={{ fontFamily: `${fontFamily}, sans-serif` }} >
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
            fontFamily={fontFamily}
          />
        )}

      </div>
    </div>
  );
};

export default ProcessedTextDisplay;
