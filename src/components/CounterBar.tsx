import { useState, useRef } from "react";
import { Icon } from "@iconify/react";
import styles from "./CounterBar.module.css";

interface CounterBarProps {
  text: string;
  generateQueryString?: () => string;
  showShareLink?: boolean;
  showDownloadFile?: boolean;
  showUploadFile?: boolean;
  showClear?: boolean;
  onSetText?: (text: string) => void;
}

export default function CounterBar({
  text,
  generateQueryString,
  showShareLink,
  showUploadFile,
  showDownloadFile,
  showClear,
  onSetText,
}: CounterBarProps) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_UPLOAD_LENGTH = 10000;

  const characterCount = [...text].length;
  const byteCount = new TextEncoder().encode(text).length;

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
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

  const handleShare = async () => {
    if (!navigator.share || !generateQueryString) {
      handleCopyLink(); // fallback
      return;
    }

    const queryString = generateQueryString();
    const url = `${window.location.origin}${window.location.pathname}${queryString}`;
    try {
      await navigator.share({ url });
    } catch (err) {
      console.warn("Share cancelled or failed:", err);
      handleCopyLink(); // fallback
    }
  };

  const handleDownloadFile = async () => {
    const showSaveFilePicker = (window as any).showSaveFilePicker;

    if (typeof showSaveFilePicker === "function") {
      try {
        const fileHandle = await showSaveFilePicker({
          suggestedName: "text.txt",
          types: [{ description: "Text Files", accept: { "text/plain": [".txt"] } }],
        });

        const writable = await fileHandle.createWritable();
        await writable.write(text);
        await writable.close();
        return;
      } catch (e) {
        console.warn("User canceled or error:", e);
        return;
      }
    }

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "text.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const slicedBlob = file.slice(0, MAX_UPLOAD_LENGTH);
    const reader = new FileReader();
    reader.onload = () => onSetText?.(reader.result as string);
    reader.readAsText(slicedBlob);
  };

  return (
    <div className={styles.counterBar}>
      <button onClick={handleCopy} className={styles.barButton} title="Copy to clipboard">
        <Icon
          icon={copied ? "mdi:check" : "mdi:content-copy"}
          className={`${styles.icon} ${copied ? styles.iconCheck : styles.iconCopy}`}
        />
      </button>

      {generateQueryString && !showShareLink && (
        <button onClick={handleCopyLink} className={styles.barButton} title="Copy link with parameters">
          <Icon
            icon={linkCopied ? "mdi:check" : "mdi:link-variant"}
            className={`${styles.icon} ${linkCopied ? styles.iconCheck : styles.iconCopy}`}
          />
        </button>
      )}

      {generateQueryString && showShareLink && (
        <button onClick={handleShare} className={styles.barButton} title="Share this">
          <Icon icon="tabler:share-3" className={styles.icon} />
        </button>
      )}

      {showDownloadFile && (
        <button onClick={handleDownloadFile} className={styles.barButton} title="Download file">
          <Icon icon="mdi:download" className={styles.icon} />
        </button>
      )}

      {showUploadFile && (
        <>
          <button onClick={() => fileInputRef.current?.click()} className={styles.barButton} title="Upload file">
            <Icon icon="mdi:upload" className={styles.icon} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            style={{ display: "none" }}
            onChange={handleUploadFile}
          />
        </>
      )}

      {showClear && onSetText && (
        <button onClick={() => onSetText("")} className={styles.barButton} title="Clear text">
          <Icon icon="mdi:delete-outline" className={styles.icon} />
        </button>
      )}

      <p>{characterCount}&nbsp;characters {byteCount}&nbsp;bytes</p>
    </div>
  );
}
