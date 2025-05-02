import { useState, useEffect, RefObject } from "react";
import { Icon } from "@iconify/react";
import styles from "./CounterBar.module.css";

interface CounterBarProps {
  textareaRef: RefObject<HTMLTextAreaElement>;
  generateQueryString?: () => string;
}

export default function CounterBar({ textareaRef, generateQueryString }: CounterBarProps) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
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

  const handleCopyLink = () => {
    if (generateQueryString) {
      const queryString = generateQueryString();
      const url = `${window.location.origin}${window.location.pathname}${queryString}`;
      navigator.clipboard.writeText(url).then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
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
        <Icon
          icon={copied ? "mdi:check" : "mdi:content-copy"}
          className={`${styles.icon} ${copied ? styles.iconCheck : styles.iconCopy}`}
        />
      </button>
      {generateQueryString && (
        <button
          onClick={handleCopyLink}
          className={styles.copyButton}
          title="Copy link with parameters"
        >
          <Icon
            icon={linkCopied ? "mdi:check" : "mdi:link-variant"}
            className={`${styles.icon} ${linkCopied ? styles.iconCheck : styles.iconCopy}`}
          />
        </button>
      )}
      <p>{characterCount}&nbsp;characters {byteCount}&nbsp;bytes</p>
    </div>
  );
}
