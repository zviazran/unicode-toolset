import { useState, useEffect, useRef } from "react";
import styles from "./NormalizationPanel.module.css";

type NormalizationForm = "NFC" | "NFD" | "NFKC" | "NFKD";

type Props = {
  text: string;
  setText: (t: string) => void;
};

const descriptions: Record<string, string> = {
  Original: "Before any change",
  NFC: "Combines base letters and accents.",
  NFD: "Splits characters into parts.",
  NFKC: "Simplifies and unifies formatting.",
  NFKD: "Fully decomposes and simplifies.",
};

export default function NormalizationPanel({ text, setText }: Props) {
  const [selectedForm, setSelectedForm] = useState("Original");
  const [originalFrozen, setOriginalFrozen] = useState<string | null>(null);
  const [hoveredForm, setHoveredForm] = useState<string | null>(null);
  const fromNormalizationRef = useRef(false);
  const lastAppliedTextRef = useRef(text);

  const getDisplayedDescription = () => {
    return descriptions[hoveredForm ?? selectedForm];
  };

  useEffect(() => {
    if (fromNormalizationRef.current) {
      fromNormalizationRef.current = false;
      return;
    }

    // Text changed and it's different from the last normalized value
    if (text !== lastAppliedTextRef.current) {
      setSelectedForm("Original");
      setOriginalFrozen(null);
      lastAppliedTextRef.current = text; // treat as new "original"
    }
  }, [text]);

  const handleSelect = (form: string) => {
    if (form !== "Original" && !originalFrozen) {
      setOriginalFrozen(text);
    }

    const base = originalFrozen ?? text;
    const next = form === "Original" ? (originalFrozen ?? text) : base.normalize(form as NormalizationForm);

    fromNormalizationRef.current = true;
    lastAppliedTextRef.current = next;

    setSelectedForm(form);
    setText(next);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.row}>
        <button
          onClick={() => handleSelect("NFC")}
          title="Normalization Form C (Composition)"
          onMouseEnter={() => setHoveredForm("NFC")}
          className={selectedForm === "NFC" ? styles.selectedButton : styles.normalButton}
        >
          NFC
        </button>
        <button
          onClick={() => handleSelect("NFD")}
          title="Normalization Form D (Decomposition)"
          onMouseEnter={() => setHoveredForm("NFD")}
          className={selectedForm === "NFD" ? styles.selectedButton : styles.normalButton}
        >
          NFD
        </button>
      </div>

      <div className={styles.row}>
        <button
          onClick={() => handleSelect("NFKC")}
          title="Normalization Form KC (Compatibility Composition)"
          onMouseEnter={() => setHoveredForm("NFKC")}
          className={selectedForm === "NFKC" ? styles.selectedButton : styles.normalButton}
        >
          NFKC
        </button>
        <button
          onClick={() => handleSelect("NFKD")}
          title="Normalization Form KD (Compatibility Decomposition)"
          onMouseEnter={() => setHoveredForm("NFKD")}
          className={selectedForm === "NFKD" ? styles.selectedButton : styles.normalButton}
        >
          NFKD
        </button>
      </div>

      <div className={styles.description}>
        {getDisplayedDescription()}
      </div>

      <div className={styles.row}>
        <button
          onClick={() => handleSelect("Original")}
          disabled={!originalFrozen}
          className={selectedForm === "Original" ? styles.selectedButton : styles.normalButton}
        >
          Original Text
        </button>
      </div>

    </div>
  );
}
