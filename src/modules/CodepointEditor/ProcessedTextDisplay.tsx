import React, { useMemo, useEffect, useRef, useState } from "react";
import styles from "./ProcessedTextDisplay.module.css";
import CodepointDialog from "./CodepointDialog";
import CollapsibleToolbar from "../../components/CollapsibleToolbar";
import { Icon } from "@iconify/react";
import ShowDirectionArrowIcon from "../../assets/icons/ShowDirectionArrowIcon";
import useUnicodeData from "../../hooks/useUnicodeData";
import CodepointChecker from "../../utils/CodepointChecker";
import bidiFactory from 'bidi-js';


type ProcessedTextDisplayProps = {
  text: string;
  setText: (text: string) => void;
  selectionRange: { start: number; end: number };
  onAnalysisChange?: (hasFindings: boolean) => void;
  selectedFont?: string;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
};

const ProcessedTextDisplay: React.FC<ProcessedTextDisplayProps> = ({ text, setText, selectionRange, onAnalysisChange, selectedFont, textareaRef }) => {
  const processedTextRef = useRef<HTMLDivElement>(null);
  const [dialogData, setDialogData] = useState<{
    codePoint: number;
    position: number;
    originalChar: string;
  } | null>(null);
  const [isRtl, setIsRtl] = useState(false);
  const [displayStyle, setDisplayStyle] = useState("U+hex");
  const { getEntry } = useUnicodeData();
  const dottedCircleAllowedScripts = ["Inherited", "Common", "Latin", "Greek", "Cyrillic"];
  const dottedCircleSafeFonts = ["sans-serif", "Noto Sans", "Roboto", "DejaVu Sans", "Arial Unicode MS", "San Francisco", "Segoe UI"];
  const hasDetectedInitialDirection = useRef(false);
  const [showDirectionArrows, setShowDirectionArrows] = useState(false);

  const bidi = bidiFactory()
  function getDirectionArrow(char: string): JSX.Element {
    const bidiClass = bidi.getBidiCharTypeName(char);
    if (["R", "AL"].includes(bidiClass))
      return <span style={{ color: "magenta" }}>←</span>;
    if (bidiClass === "L")
      return <span style={{ color: "darkblue" }}>→</span>;
    return <span style={{ color: "gray" }}>•</span>;
  }

  useEffect(() => {
    if (!text && hasDetectedInitialDirection.current)
      hasDetectedInitialDirection.current = false;
    else if (!hasDetectedInitialDirection.current && text && text.length > 0) {
      let detectedRtl = false;
      if (textareaRef && textareaRef.current) {
        const dir = textareaRef.current.dir;
        if (dir === "rtl") detectedRtl = true;
        else if (dir === "auto") {
          const firstChar = text.trim()[0];
          if (firstChar && CodepointChecker.isHebrewOrArabic(firstChar)) detectedRtl = true;
        }
      }
      setIsRtl(detectedRtl);
      hasDetectedInitialDirection.current = true;
    }
  }, [text, textareaRef?.current?.dir]);

  const toggleDirection = () => {
    setIsRtl((prev) => !prev);
    hasDetectedInitialDirection.current = true;
  };

  function getScriptColor(index: number): string {
    if (index === 0) return "undefined";
    const baseHue = 35; // orange
    const saturation = 100;
    const lightness = Math.max(30, 90 - (index - 1) * 8); // from 90% to 30%
    return `hsl(${baseHue}, ${saturation}%, ${lightness}%)`;
  }

  const replaceUnseenChars = (text: string, selectionRange: { start: number; end: number }, selectedFont: string, flagCallback?: (hasFinding: boolean) => void): (string | JSX.Element)[] => {
    const result: (string | JSX.Element)[] = [];
    const scriptToColor: Record<string, string> = {};
    const shouldOverlayDottedCircle = dottedCircleSafeFonts.includes(selectedFont ?? "");

    for (let i = 0; i < text.length;) {
      const codePoint = text.codePointAt(i)!;
      const char = String.fromCodePoint(codePoint);
      const startIndex = i;
      const isInvisible = CodepointChecker.isInvisibleCodePoint(codePoint);
      const isTagChar = codePoint >= 0xe0020 && codePoint <= 0xe007f;
      const isWordBreakChar = CodepointChecker.isWordBreakChar(char);
      const isNoBreakChar = CodepointChecker.isNoBreakChar(char);
      const isAIIndicator = CodepointChecker.isAIIndicator(char);

      const isSelected = i >= selectionRange.start && i < selectionRange.end;
      const isCursorHere = selectionRange.start === selectionRange.end && selectionRange.start === i;
      const script = getEntry(codePoint)?.script ?? "Unknown";
      let extraStyle: React.CSSProperties = {};

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
        if (dottedCircleAllowedScripts.includes(script) && getEntry(codePoint)?.category.startsWith("M")) {
          if (shouldOverlayDottedCircle)
            displayedChar = `\u25CC${char}`;
          extraStyle.minWidth = "0.7em";
        }

        const finding = displayedChar !== char || isAIIndicator;
        if (finding) flagCallback?.(true);

        return displayedChar;
      };

      const shouldIgnoreScript = (script === "Common" && codePoint < 1000) || CodepointChecker.isEmoji(codePoint) || script === "Inherited" || script === "Unknown";
      const isStyleTarget = !isInvisible && !isTagChar && !isWordBreakChar && !isNoBreakChar && !isAIIndicator && !shouldIgnoreScript;
      if (isStyleTarget && !(script in scriptToColor)) {
        const nextIndex = Object.keys(scriptToColor).length;
        scriptToColor[script] = getScriptColor(nextIndex);
      }
      if (isStyleTarget) {
        extraStyle.backgroundColor = scriptToColor[script];
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
            style={extraStyle}
            contentEditable={false}
            suppressContentEditableWarning
            data-original={char}
            title={`U+${codePoint.toString(16).toUpperCase()} - ${script}`}
            ref={(el) => {
              if (el) {
                requestAnimationFrame(() => {
                  el.classList.add(styles.newlyAddedChar);
                });
              }
            }}
            onClick={() => {
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
            {showDirectionArrows && <div className={styles.directionIndicator}>{getDirectionArrow(char)}</div>}
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

  const [postRenderPass, setPostRenderPass] = useState(0);
  useEffect(() => { setTimeout(() => setPostRenderPass(1), 200); }, []);

  const analysisResult = useMemo(() => {
    let findings = false;
    const result = replaceUnseenChars(text, selectionRange, selectedFont ?? "", (flag) => {
      findings ||= flag;
    });
    return { result, findings };
  }, [text, selectionRange, displayStyle, selectedFont, showDirectionArrows, postRenderPass]);

  useEffect(() => {
    onAnalysisChange?.(analysisResult.findings);
  }, [analysisResult.findings, onAnalysisChange]);

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

        <button
          onClick={() => setShowDirectionArrows(prev => !prev)}
          className={styles.toolbarButton}
          style={{ transform: "translateY(-1px)" }}
          title="Toggle Direction Indicators"
        >
          <ShowDirectionArrowIcon showArrow={!showDirectionArrows} className={styles.toolbarIcon} />
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
      <div ref={processedTextRef} className={`${styles.processedText} ${isRtl ? styles.rtlInput : styles.ltrInput}`} style={{ fontFamily: selectedFont }} >
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
            fontFamily={selectedFont}
          />
        )}

      </div>
    </div>
  );
};

export default ProcessedTextDisplay;
