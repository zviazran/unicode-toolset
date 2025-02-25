import { useState, RefObject } from "react";
import { AiOutlineCopy, AiOutlineCheck } from "react-icons/ai";
import styles from './CounterBar.module.css';

interface CounterBarProps {
  textareaRef: RefObject<HTMLTextAreaElement>;
}

export default function CounterBar({ textareaRef }: CounterBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (textareaRef.current) {
      navigator.clipboard.writeText(textareaRef.current.value).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const characterCount = textareaRef.current?.value.length || 0;
  const byteCount = new TextEncoder().encode(textareaRef.current?.value || "").length;

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
      <p>{characterCount} characters, {byteCount} bytes</p>
    </div>
  );
}
