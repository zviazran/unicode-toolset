import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from './CodepointEditor.module.css';
import innerStyles from './ProcessedTextDisplay.module.css';
import CounterBar from '../../components/CounterBar';
import CharGenerator from "../../utils/CharGenerator";
import PlainTextInput from "./PlainTextInput";
import ProcessedTextDisplay from "./ProcessedTextDisplay";
import CollapsiblePanel from "../../components/CollapsiblePanel";
import { TypingSequencePanel } from "./TypingSequenceAnimation";
import NormalizationPanel from "./NormalizationPanel";
import { HomographicSpoofingPanel } from "./HomographicSpoofingPanel";
import { NoiseGeneratorPanel } from "./NoiseGeneratorPanel";
import LegendDialog from "./LegendDialog";
import { IndicatorsCleaner } from "string-twister";
import WebFont from 'webfontloader';
import BIDISupport from "./BIDISupport";

const CodepointEditor: React.FC = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [normalText, setNormalText] = useState("");
  const [processedText, setProcessedText] = useState<string>("");
  const [isTagTyping, setIsAddTagsMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [lastSelection, setLastSelection] = useState<{ start: number; end: number }>({ start: -1, end: -1 });
  const typingPanelRef = useRef<{ stopTyping: () => void }>(null);
  const [playInitialDemo, setPlayInitialDemo] = useState(false);
  const [hasTextIndicators, setHasTextIndicators] = useState(false);
  const [openPanels, setOpenPanels] = useState<Record<string, boolean>>({});
  const [selectedFont, setSelectedFont] = useState("sans-serif");
  const [isButtonClick, setIsButtonClick] = useState(false);

  const isMobileView = window.innerWidth < 768;

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
  }, []);

  const handleAddChar = (type: "invisible" | "wordBreak" | "noBreak" | "bidi", bidiName?: string) => {
    let randomChar = "";
    if (type === "invisible") randomChar = CharGenerator.getRandomInvisibleChar();
    else if (type === "wordBreak") randomChar = CharGenerator.getRandomWordBreak();
    else if (type === "noBreak") randomChar = CharGenerator.getRandomNoBreak();
    else if (type === "bidi" && bidiName) {
      randomChar = CharGenerator.getBidiChar(bidiName);
    }

    let updatedText = "";
    let cursorPos = 0;
    if (lastSelection && textareaRef.current && lastSelection.start >= 0 && lastSelection.end >= 0) {
      const { start, end } = lastSelection;
      updatedText = normalText.slice(0, start) + randomChar + normalText.slice(end);
      cursorPos = start + randomChar.length;
      setLastSelection({ start: -1, end: -1 });
    } else {
      const chars = [...normalText];
      const insertPos = chars.length > 4 ? Math.floor(Math.random() * (chars.length - 1)) + 1 : Math.floor(Math.random() * (chars.length + 1));
      chars.splice(insertPos, 0, randomChar);
      updatedText = chars.join('');
      cursorPos = insertPos + randomChar.length;
    }
    setText(updatedText);
    setTimeout(() => {
      const node = textareaRef.current;
      if (node) {
        node.selectionStart = node.selectionEnd = cursorPos;
      }
    }, 0);
  };

  const handlePanelToggle = (key: string, isOpen: boolean) => {
    typingPanelRef.current?.stopTyping();
    setOpenPanels((prev) => ({ ...prev, [key]: isOpen }));
  };

  function describeTextIndicators(text: string): string {
    const osList = IndicatorsCleaner.findOSIndicators(text);
    if (osList.length === 0) return "Looks normal.";
    if (osList.length === 1) return `OS indicator: ${osList[0]}`;
    return `Text indicators: ${osList.slice(0, -1).join(", ")} & ${osList.slice(-1)}`;
  }

  function loadFontDynamically(fontName: string) {
    WebFont.load({ google: { families: [fontName] } });
  }

  const panels = [
    {
      key: "spoofing",
      title: "Homographic spoofing",
      content: (
        <HomographicSpoofingPanel
          setText={setText}
          getCurrentText={() => normalText}
          scrollTargetRef={textareaRef}
        />
      ),
    },
    {
      key: "indicators",
      title: "Text Indicators",
      content: (
        <div className={styles.buttonColumn}>
          <div className={styles.description}>{describeTextIndicators(normalText)}</div>
          <button
            disabled={!hasTextIndicators}
            onClick={() => setText(IndicatorsCleaner.deepClean(normalText))}
            className={`${styles.charButton} ${innerStyles.aiIndicator}`}
            title={!hasTextIndicators ? "No indicators found" : undefined}
          >
            Deep Clean
          </button>
        </div>
      ),
    },

    {
      key: "typing",
      title: "Examples & Animations",
      content: (
        <TypingSequencePanel
          setText={setText}
          getCurrentText={() => normalText}
          playInitialDemo={playInitialDemo}
          scrollTargetRef={textareaRef}
          ref={typingPanelRef}
        />
      ),
    },
    {
      key: "noise",
      title: "Noise Generator",
      content: (
        <NoiseGeneratorPanel
          setText={setText}
          getCurrentText={() => normalText}
          scrollTargetRef={textareaRef}
        />
      ),
    },

    {
      key: "unseen",
      title: "Add Unseen Characters",
      content: (
        <div className={styles.buttonColumn}>
          <label className={styles.tagToggle}>
            <input
              type="checkbox"
              checked={isTagTyping}
              onChange={() => setIsAddTagsMode((prev) => !prev)}
            />
            <span>Tag Typing</span>
          </label>
          <button onPointerDown={() => { setIsButtonClick(true); const node = textareaRef.current; if (node) setLastSelection({ start: node.selectionStart ?? -1, end: node.selectionEnd ?? -1 }); }} onClick={() => { handleAddChar("invisible"); setIsButtonClick(false); }} className={`${styles.charButton} ${innerStyles.invisibleChar}`}>
            Add Random Invisible Character
          </button>
          <button onPointerDown={() => { setIsButtonClick(true); const node = textareaRef.current; if (node) setLastSelection({ start: node.selectionStart ?? -1, end: node.selectionEnd ?? -1 }); }} onClick={() => { handleAddChar("wordBreak"); setIsButtonClick(false); }} className={`${styles.charButton} ${innerStyles.wordBreakChar}`}>
            Add Random Word-Break Space
          </button>
          <button onPointerDown={() => { setIsButtonClick(true); const node = textareaRef.current; if (node) setLastSelection({ start: node.selectionStart ?? -1, end: node.selectionEnd ?? -1 }); }} onClick={() => { handleAddChar("noBreak"); setIsButtonClick(false); }} className={`${styles.charButton} ${innerStyles.noBreakChar}`}>
            Add Random No-Break Space
          </button>
        </div>
      ),
    },
    {
      key: "BIDISupport",
      title: "Invisible BIDI Support",
      content: (
        <BIDISupport
          handleAddChar={handleAddChar}
          textareaRef={textareaRef}
          setIsButtonClick={setIsButtonClick}
          setLastSelection={setLastSelection}
        />
      ),
    },

    {
      key: "normalization",
      title: "Normalization",
      content: (
        <NormalizationPanel
          text={normalText}
          setText={setText}
        />
      ),
    },
    {
      key: "fonts",
      title: "Fonts",
      content: (
        <div className={styles.buttonColumn}>
          <select
            value={selectedFont}
            onChange={(e) => {
              const font = e.target.value;
              setSelectedFont(font);
              loadFontDynamically(font);
            }}
          >
            {["sans-serif", "Noto Sans", "Roboto", "DejaVu Sans", "Arial Unicode MS", "San Francisco", "Segoe UI", "monospace"].map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>
      ),
    }
  ];

  const orderedPanels = isMobileView
    ? [...panels].sort((a, b) => {
      const aOpen = openPanels[a.key] ? -1 : 0;
      const bOpen = openPanels[b.key] ? -1 : 0;
      return aOpen - bOpen;
    })
    : panels;

  return (
    <div className={styles.codepointEditor}>
      <h1>The Unseen Side Of Text</h1>
      <div className={styles.description}>
        <p>Inspect and edit text at the codepoint level.</p>
      </div>
      <div className={styles.editor}>
        <div className={styles.textBox}>
          <h2>What we see</h2>
          <PlainTextInput
            textareaRef={textareaRef}
            value={normalText}
            onChange={setText}
            placeholder="Type your text here..."
            isTagTyping={isTagTyping}
            onSelectionChange={(start, end) => { setLastSelection({ start, end }); }}
            onClick={() => { typingPanelRef.current?.stopTyping(); }}
            fontFamily={selectedFont}
            onBlur={() => { if (!isButtonClick) setLastSelection({ start: -1, end: -1 }); }}
          />
        </div>
        <div className={styles.textBox}>
          <h2>What the computer sees<LegendDialog /></h2>
          <ProcessedTextDisplay
            text={processedText}
            setText={setText}
            selectionRange={lastSelection}
            onAnalysisChange={(hasfindings) => setHasTextIndicators(hasfindings)}
            selectedFont={selectedFont}
            textareaRef={textareaRef}
          />
        </div>
      </div>
      <CounterBar
        text={normalText}
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
          navigate({ pathname: location.pathname, search: queryString }, { replace: true });
          return queryString ? `?${queryString}` : "";
        }}
        showShareLink
        showDownloadFile
        showUploadFile
        onSetText={setText}
      />
      <div className={styles.panelGrid}>
        {orderedPanels.map(panel => (
          <CollapsiblePanel
            key={panel.key}
            title={panel.title}
            queryKey={panel.key}
            onToggle={handlePanelToggle}
          >
            {panel.content}
          </CollapsiblePanel>
        ))}
      </div>
    </div>
  );
};

export default CodepointEditor;
