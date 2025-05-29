import { useState, useEffect } from "react";

type NormalizationForm = "NFC" | "NFD" | "NFKC" | "NFKD";

type Props = {
  text: string;
  setText: (t: string) => void;
};

const forms = ["Original", "NFC", "NFD", "NFKC", "NFKD"] as const;

const descriptions: Record<string, string> = {
  Original: "Before any change",
  NFC: "Combine parts",
  NFD: "Split into parts",
  NFKC: "Simplify and combine",
  NFKD: "Simplify and split",
};

export default function NormalizationPanel({ text, setText }: Props) {
  const [selectedForm, setSelectedForm] = useState("Original");
  const [originalFrozen, setOriginalFrozen] = useState<string | null>(null);

  // Reset originalFrozen if user edits the text manually (without button click)
  useEffect(() => {
    if (selectedForm === "Original" && originalFrozen && text !== originalFrozen) {
      setOriginalFrozen(null);
    }
  }, [text]);

  const handleSelect = (form: string) => {
    if (form !== "Original" && !originalFrozen) {
      setOriginalFrozen(text);
    }

    const base = originalFrozen ?? text;
    const next = form === "Original" ? (originalFrozen ?? text) : base.normalize(form as NormalizationForm);

    setSelectedForm(form);
    setText(next);
  };

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" }}>
        {forms.map((form) => (
          <button
            key={form}
            onClick={() => handleSelect(form)}
            className={selectedForm === form ? "selectedButton" : "normalButton"}
          >
            {form}
          </button>
        ))}
      </div>

      <div
        style={{
          fontSize: "0.85em",
          color: "#666",
          marginBottom: "0.75rem",
          minHeight: "1.2em",
        }}
      >
        {descriptions[selectedForm]}
      </div>
    </div>
  );
}
