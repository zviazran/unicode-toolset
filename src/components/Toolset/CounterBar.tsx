import { useState, useEffect, RefObject, useRef } from "react";
import { Icon } from "@iconify/react";
import DirectionIcon from "../../assets/icons/DirectionIcon";
import styles from "./CounterBar.module.css";

interface CounterBarProps {
  textareaRef: RefObject<HTMLTextAreaElement>;
  generateQueryString?: () => string;
  showDownloadFile?: boolean;
  showUploadFile?: boolean;
  showClear?: boolean;
  showDirectionToggle?: boolean;
  onSetText?: (text : string) => void;
}

export default function CounterBar({
  textareaRef,
  generateQueryString,
  showUploadFile,
  showDownloadFile,
  showClear,
  showDirectionToggle,
  onSetText,
}: CounterBarProps) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [byteCount, setByteCount] = useState(0);
  const [direction, setDirection] = useState<"auto" | "ltr" | "rtl">("auto");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_UPLOAD_LENGTH = 10000;

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

  const handleDownloadFile = async () => {
    const text = textareaRef.current?.value || "";

    const showSaveFilePicker = (window as any).showSaveFilePicker;

    if (typeof showSaveFilePicker === "function") {
      try {
        const fileHandle = await showSaveFilePicker({
          suggestedName: "text.txt",
          types: [
            {
              description: "Text Files",
              accept: { "text/plain": [".txt"] },
            },
          ],
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

    // Slice only the first N bytes (safe for plain text or UTF-8 ASCII)
    const slicedBlob = file.slice(0, MAX_UPLOAD_LENGTH);
    const reader = new FileReader();
    reader.onload = () => {
      onSetText?.(reader.result as string);
    };
    reader.readAsText(slicedBlob);
  };

  const updateCounts = () => {
    if (textareaRef.current) {
      const text = textareaRef.current.value;
      setCharacterCount(text.length);
      setByteCount(new TextEncoder().encode(text).length);
    }
  };

  // On mount: determine initial direction from URL or textarea, and set state
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const query = new URLSearchParams(location.search);
    const urlDir = query.get("dir");

    const fallbackDir = (textarea.getAttribute("dir") ?? "auto") as "auto" | "ltr" | "rtl";
    const initialDir: "auto" | "ltr" | "rtl" =
      urlDir === "rtl" || urlDir === "ltr" ? urlDir : fallbackDir;

    setDirection(initialDir);
    updateCounts();
  }, []);

  // Whenever direction state changes, apply it to the DOM
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.dir = direction;
    }
  }, [direction]);

  return (
    <div className={styles.counterBar}>
      <button
        onClick={handleCopy}
        className={styles.barButton}
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
          className={styles.barButton}
          title="Copy link with parameters"
        >
          <Icon
            icon={linkCopied ? "mdi:check" : "mdi:link-variant"}
            className={`${styles.icon} ${linkCopied ? styles.iconCheck : styles.iconCopy}`}
          />
        </button>
      )}

      {showDownloadFile && (
        <button
          onClick={handleDownloadFile}
          className={styles.barButton}
          title="Download file"
        >
          <Icon icon="mdi:download" className={styles.icon} />
        </button>
      )}

      {showUploadFile && (
        <>
          <button
            onClick={() => fileInputRef.current?.click()}
            className={styles.barButton}
            title="Upload file"
          >
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
        <button
          onClick={() => onSetText("")}
          className={styles.barButton}
          title="Clear text"
        >
          <Icon icon="mdi:delete-outline" className={styles.icon} />
        </button>
      )}

      {showDirectionToggle && (
        <button
          onClick={() =>
            setDirection((prev) =>
              prev === "auto" ? "ltr" : prev === "ltr" ? "rtl" : "auto"
            )
          }
          className={styles.barButton}
          title={`Direction: ${direction.toUpperCase()} (click to change)`}
        >
          <DirectionIcon direction={direction} className={styles.icon} />
        </button>
      )}

      <p>{characterCount}&nbsp;characters {byteCount}&nbsp;bytes</p>
    </div>
  );
}
