import { useState, useEffect, RefObject } from "react";
import { AiOutlineCopy, AiOutlineCheck } from "react-icons/ai";
import styles from "./CounterBar.module.css";

interface CounterBarProps {
  textareaRef: RefObject<HTMLTextAreaElement>;
}

export default function CounterBar({ textareaRef }: CounterBarProps) {
  const [copied, setCopied] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [byteCount, setByteCount] = useState(0);

  const handleCopy = () => {
    if (textareaRef.current) {
      navigator.clipboard.writeText(textareaRef.current.value).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const updateCounts = () => {
    if (textareaRef.current) {
      const text = textareaRef.current.value;
      setCharacterCount(text.length);
      setByteCount(new TextEncoder().encode(text).length);
    }
  };

  // Run `updateCounts` whenever the component renders
  useEffect(() => {
    updateCounts();
  });

  return (
    <div className={styles.counterBar}>
      <button
        onClick={handleCopy}
        className={styles.copyButton}
        title="Copy to clipboard"
      >
        {copied ? (
          <AiOutlineCheck className={`${styles.icon} ${styles.iconCheck}`} />
        ) : (
          <AiOutlineCopy className={`${styles.icon} ${styles.iconCopy}`} />
        )}
      </button>
      <p>{characterCount}&nbsp;characters {byteCount}&nbsp;bytes</p>
    </div>
  );
}
