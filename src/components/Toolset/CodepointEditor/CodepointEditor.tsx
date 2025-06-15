import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import styles from './CodepointEditor.module.css';
import innerStyles from './ProcessedTextDisplay.module.css';
import CounterBar from '../CounterBar';
import { invisibleCharRanges, WordBreakWSegSpaceNewlineRegex, DecompositionTypeNoBreakRegex } from "../CodePointsConsts";
import ProcessedTextDisplay from "./ProcessedTextDisplay";
import CollapsiblePanel from "./CollapsiblePanel";
import { TypingSequencePanel } from "./TypingSequenceAnimation";
import NormalizationPanel from "./NormalizationPanel";
import LegendDialog from "./LegendDialog";
import { IndicatorsCleaner } from "string-twister";

const computeValidRanges = (): [number, number][] => {
  const RandomInvisiblesExcludedRanges = [
    [0x200c, 0x200c],
    [0x202a, 0x202e],
    [0x1d173, 0x1d17a],
    [0xe0000, 0xe01ff],
  ];

  const validRanges: [number, number][] = [];

  for (const [start, end] of invisibleCharRanges) {
    let currentStart = start;

    for (const [exStart, exEnd] of RandomInvisiblesExcludedRanges) {
      if (exEnd < currentStart) continue; // Skip exclusions that are before our range
      if (exStart > end) break; // No more exclusions affect this range

      if (currentStart < exStart) {
        validRanges.push([currentStart, Math.min(end, exStart - 1)]);
      }

      currentStart = Math.max(currentStart, exEnd + 1);
    }

    if (currentStart <= end) {
      validRanges.push([currentStart, end]);
    }
  }

  return validRanges;
};

const CodepointEditor: React.FC = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [normalText, setNormalText] = useState("");
  const [processedText, setProcessedText] = useState<string>("");
  const [isTagTyping, setIsAddTagsMode] = useState(false);
  const validRanges: [number, number][] = computeValidRanges();
  const location = useLocation();
  const [lastSelection, setLastSelection] = useState<{ start: number; end: number }>({ start: -1, end: -1 });
  const typingPanelRef = useRef<{ stopTyping: () => void }>(null);
  const [playInitialDemo, setPlayInitialDemo] = useState(false);
  const [hasTextIndicators, setHasTextIndicators] = useState(false);
  const [openPanels, setOpenPanels] = useState<Record<string, boolean>>({});

  const setText = (text: string) => {
    setNormalText(text);
    setProcessedText(text);
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const query = new URLSearchParams(location.search);
    const urlText = query.get("text") ? decodeURIComponent(query.get("text")!) : "";

    if (urlText) {
      setText(urlText);
    } else {
      const hasSeenDemo = sessionStorage.getItem("hasSeenInitialDemo");
      if (!hasSeenDemo) {
        sessionStorage.setItem("hasSeenInitialDemo", "true");
        setPlayInitialDemo(true);
      }
    }

    const onSelect = () => {
      const active = document.activeElement;
      if (active === textarea) {
        setLastSelection({
          start: textarea.selectionStart ?? -1,
          end: textarea.selectionEnd ?? -1,
        });
        typingPanelRef.current?.stopTyping();
      } else if (active?.tagName !== "BUTTON") {
        setLastSelection({ start: -1, end: -1 });
      }
    };

    document.addEventListener("selectionchange", onSelect);
    return () => {
      document.removeEventListener("selectionchange", onSelect);
    };
  }, []);


  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;
    const diff = newValue.length - normalText.length;

    if (isTagTyping && diff > 0) {
      const insertedText = newValue.slice(cursorPosition - diff, cursorPosition);

      // Convert each character to its invisible tag version
      const invisibleText = Array.from(insertedText)
        .filter((char) => /^[a-zA-Z0-9 !@#$%^&*()]$/.test(char))
        .map((char) => String.fromCodePoint(0xe0000 + char.charCodeAt(0)))
        .join("");
      // Reinsert the processed text at the correct position
      const updatedValue =
        newValue.slice(0, cursorPosition - diff) +
        invisibleText +
        newValue.slice(cursorPosition);

      // Update state with the new value
      setText(updatedValue);

      // Adjust cursor position to after the processed text
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = cursorPosition - diff + invisibleText.length;
      }, 0);
    } else {
      // Handle deletions or no changes
      setText(newValue);
    }
  };

  const getRandomInvisibleChar = (): string => {
    const [start, end] = validRanges[Math.floor(Math.random() * validRanges.length)];
    const codePoint = Math.floor(Math.random() * (end - start + 1)) + start;

    return String.fromCodePoint(codePoint);
  };

  function getRandomCharFromRegex(regex: RegExp): string {
    const cps = new Set<number>();
    const rx = regex.source;

    rx.replace(/\\u\{([0-9a-fA-F]+)\}|\\u([0-9a-fA-F]{4})/g, (_, braced, short) => {
      cps.add(parseInt(braced || short, 16));
      return "";
    });

    rx.replace(/\\u(?:\{)?([0-9a-fA-F]+)(?:\})?-\\u(?:\{)?([0-9a-fA-F]+)(?:\})?/g, (_, a, b) => {
      for (let i = parseInt(a, 16); i <= parseInt(b, 16); i++) cps.add(i);
      return "";
    });

    const list = [...cps];
    const cp = list[Math.floor(Math.random() * list.length)];
    return cp !== undefined ? String.fromCodePoint(cp) : "";
  }

  const handleAddChar = (type: "invisible" | "wordBreak" | "noBreak") => {
    let randomChar = "";

    if (type === "invisible") {
      randomChar = getRandomInvisibleChar();
    } else if (type === "wordBreak") {
      randomChar = getRandomCharFromRegex(WordBreakWSegSpaceNewlineRegex);
    } else if (type === "noBreak") {
      randomChar = getRandomCharFromRegex(DecompositionTypeNoBreakRegex);
    }

    let updatedText = "";

    if (lastSelection && textareaRef.current && lastSelection.start >= 0 && lastSelection.end >= 0) {
      const { start, end } = lastSelection;
      updatedText = normalText.slice(0, start) + randomChar + normalText.slice(end);
      setLastSelection({ start: -1, end: -1 });
    } else {
      const chars = [...normalText]; // Unicode-safe
      const insertPos = chars.length > 4
        ? Math.floor(Math.random() * (chars.length - 1)) + 1
        : Math.floor(Math.random() * (chars.length + 1));
      chars.splice(insertPos, 0, randomChar);
      updatedText = chars.join('');
    }

    setText(updatedText);
  };

  const handlePanelToggle = (key: string, isOpen: boolean) => {
    setOpenPanels((prev) => ({ ...prev, [key]: isOpen }));
  };

  function describeTextIndicators(text: string): string {
    const osList = IndicatorsCleaner.findOSIndicators(text);
    if (osList.length === 0) return "Looks normal.";
    if (osList.length === 1) return `OS indicator: ${osList[0]}`;
    return `Text indicators: ${osList.slice(0, -1).join(", ")} & ${osList.slice(-1)}`;
  }

  return (
    <div className={styles.codepointEditor}>
      <h1>The Unseen Side Of Text</h1>
      <div className={styles.description}>
        <p>Inspect and edit text at the codepoint level.</p>
      </div>
      <div className={styles.editor}>
        <div className={styles.textBox}>
          <h2>What we see</h2>
          <textarea className={styles.normalText}
            ref={textareaRef}
            value={normalText}
            onChange={handleTextChange}
            placeholder="Type your text here..."
          />
        </div>
        <div className={styles.textBox}>
          <h2>What the computer sees<LegendDialog /></h2>
          <ProcessedTextDisplay text={processedText} setText={setText} selectionRange={lastSelection} onAnalysisChange={(hasfindings) => setHasTextIndicators(hasfindings)} />
        </div>
      </div>
      <CounterBar
        textareaRef={textareaRef}
 generateQueryString={() => {
  const params = new URLSearchParams();
  const text = textareaRef.current?.value || "";
  const dir = textareaRef.current?.dir || "auto";

  if (text) params.set("text", text);
  if (dir !== "auto") params.set("dir", dir);

  Object.entries(openPanels).forEach(([key, open]) => {
    if (open) params.set(key, "1");
  });

  const queryString = params.toString();
  const fullQuery = queryString ? `?${queryString}` : "";

  // Update the URL immediately
  window.history.replaceState(null, "", `${window.location.pathname}${fullQuery}`);

  return fullQuery;
}}
        showDownloadFile
        showUploadFile
        showDirectionToggle
        onSetText={setText}
      />
      <div className={styles.panelGrid}>
        <CollapsiblePanel title="Text Indicators" queryKey="indicators" onToggle={handlePanelToggle}>
          <div className={styles.buttonColumn}>
            <div className={styles.description}>
              {describeTextIndicators(normalText)}
            </div>
            <button
              disabled={!hasTextIndicators}
              onClick={() => setText(IndicatorsCleaner.deepClean(normalText))}
              className={`${styles.charButton} ${innerStyles.aiIndicator}`}
              title={!hasTextIndicators ? "No indicators found" : undefined}
            >
              Deep Clean
            </button>
          </div>
        </CollapsiblePanel>
        <CollapsiblePanel title="Add Unseen Characters" queryKey="unseen" onToggle={handlePanelToggle}>
          <div className={styles.buttonColumn}>
            <label className={styles.tagToggle}>
              <input
                type="checkbox"
                checked={isTagTyping}
                onChange={() => setIsAddTagsMode((prev) => !prev)}
              />
              <span>Tag Typing</span>
            </label>
            <button onClick={() => handleAddChar("invisible")} className={`${styles.charButton} ${innerStyles.invisibleChar}`}>
              Add Random Invisible Character
            </button>
            <button onClick={() => handleAddChar("wordBreak")} className={`${styles.charButton} ${innerStyles.wordBreakChar}`}>
              Add Random Word-Break Space
            </button>
            <button onClick={() => handleAddChar("noBreak")} className={`${styles.charButton} ${innerStyles.noBreakChar}`}>
              Add Random No-Break Space
            </button>
          </div>
        </CollapsiblePanel>
        <CollapsiblePanel title="Typing Animation" queryKey="typing" onToggle={handlePanelToggle}>
          <TypingSequencePanel
            setText={setText}
            getCurrentText={() => normalText}
            playInitialDemo={playInitialDemo}
            ref={typingPanelRef}
          />
        </CollapsiblePanel>
        <CollapsiblePanel title="Normalization" queryKey="normalization" onToggle={handlePanelToggle}>
          <NormalizationPanel
            text={normalText}
            setText={setText}
          />
        </CollapsiblePanel>
      </div>
    </div>
  );
};

export default CodepointEditor;
