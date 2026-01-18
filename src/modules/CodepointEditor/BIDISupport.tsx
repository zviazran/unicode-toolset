import React, { useState } from 'react';
import styles from './BIDISupport.module.css';
import editorStyles from './CodepointEditor.module.css';
import innerStyles from './ProcessedTextDisplay.module.css';

interface Props {
  handleAddChar: (type: "bidi", bidiName: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  setIsButtonClick: (value: boolean) => void;
  setLastSelection: (selection: { start: number; end: number }) => void;
}

const BIDISupport: React.FC<Props> = ({
  handleAddChar,
  textareaRef,
  setIsButtonClick,
  setLastSelection,
}) => {
  const [isRTLMode, setIsRTLMode] = useState(true);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const handleClick = (char: string) => {
    setIsButtonClick(true);
    const node = textareaRef.current;
    if (node) {
      setLastSelection({
        start: node.selectionStart ?? -1,
        end: node.selectionEnd ?? -1,
      });
    }
    handleAddChar("bidi", char);
    setIsButtonClick(false);
  };

  const renderButton = (char: string) => (
    <button
      key={char}
      onPointerDown={() => handleClick(char)}
      className={`${styles.smallCharButton} ${innerStyles.invisibleChar}`}
    >
      {char}
    </button>
  );

  const groups = isRTLMode
    ? [
        { title: "Standalone Marks", chars: ["RLM", "ALM"], desc: "Control directionality without affecting surrounding text." },
        { title: "Embedding", chars: ["RLE", "PDF"], desc: "Start and end embedding of RTL text." },
        { title: "Override", chars: ["RLO", "PDF"], desc: "Force directionality override for RTL text." },
        { title: "Isolate", chars: ["RLI", "PDI"], desc: "Isolate RTL text from surrounding content." },
        { title: "Neutral Isolate", chars: ["FSI", "PDI"], desc: "Isolate text with automatic direction detection." },
      ]
    : [
        { title: "Standalone Marks", chars: ["LRM"], desc: "Control directionality without affecting surrounding text." },
        { title: "Embedding", chars: ["LRE", "PDF"], desc: "Start and end embedding of LTR text." },
        { title: "Override", chars: ["LRO", "PDF"], desc: "Force directionality override for LTR text." },
        { title: "Isolate", chars: ["LRI", "PDI"], desc: "Isolate LTR text from surrounding content." },
        { title: "Neutral Isolate", chars: ["FSI", "PDI"], desc: "Isolate text with automatic direction detection." },
      ];

  return (
    <div className={editorStyles.buttonColumn}>
      <button
        className={editorStyles.directionToggle}
        onClick={() => setIsRTLMode(!isRTLMode)}
      >
        {isRTLMode ? "🡄 🡄 🡄 RTL" : "🡆 🡆 🡆 LTR"} Controls {isRTLMode ? "🡄 🡄 🡄" : "🡆 🡆 🡆"} 
      </button>

      {groups.map((group) => (
        <div key={group.title} className={styles.bidiGroup}>
          <div className={styles.bidiGroupHeader}>
            <span className={styles.bidiGroupTitle}>{group.title}</span>
            <div className={styles.bidiButtonRow}>
              {group.chars.map(renderButton)}
            </div>
            <button
              className={styles.bidiToggleExplain}
              onClick={() =>
                setOpenGroup(openGroup === group.title ? null : group.title)
              }
            >
              {openGroup === group.title ? "-" : "?"}
            </button>
          </div>
          {openGroup === group.title && (
            <div className={styles.bidiDescription}>{group.desc}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BIDISupport;