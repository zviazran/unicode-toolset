import { useState, useEffect, useRef } from 'react';
import BaseDialog from './BaseDialog';
import * as Dialog from '@radix-ui/react-dialog';
import { Icon } from '@iconify/react';
import styles from './CodepointDialog.module.css';

type UnicodeEntry = {
  short: string;
  long: string;
  category: string;
  script: string;
};

let unicodeDataCache: Record<string, UnicodeEntry> | null = null;

async function getUnicodeData(): Promise<Record<string, UnicodeEntry>> {
  if (!unicodeDataCache) {
    const res = await fetch('/unicode-min.json');
    const json = await res.json();
    unicodeDataCache = json as Record<string, UnicodeEntry>;
  }
  return unicodeDataCache;
}

export default function CodepointDialog({
  data,
  onClose,
}: {
  data: { codePoint: number; position: number; originalChar: string } | null;
  onClose: (newChar?: string) => void;
}) {
  const [inputValue, setInputValue] = useState("");
  const [unicodeInfo, setUnicodeInfo] = useState<UnicodeEntry | null>(null);
  const shouldDeleteRef = useRef(false);

  useEffect(() => {
    if (data) {
      const hex = data.codePoint.toString(16).toUpperCase().padStart(4, "0");
      setInputValue(`U+${hex}`);
      shouldDeleteRef.current = false;

      getUnicodeData().then((map) => {
        const entry = map[hex];
        setUnicodeInfo(entry ?? null);
      });
    }
  }, [data]);

  if (!data) return null;

  const handleClose = () => {
    if (shouldDeleteRef.current) {
      onClose("");
      return;
    }

    const trimmed = inputValue.trim();
    if (/^U\+[0-9a-f]{1,6}$/i.test(trimmed)) {
      try {
        const codePoint = parseInt(trimmed.slice(2), 16);
        const newChar = String.fromCodePoint(codePoint);
        if (newChar !== data.originalChar) {
          onClose(newChar);
          return;
        }
      } catch { }
    }

    onClose();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(data.originalChar).catch(() => {
      alert("Failed to copy character.");
    });
  };

  const unicodeLink = `https://util.unicode.org/UnicodeJsps/character.jsp?a=${data.codePoint.toString(16).toLowerCase()}`;
  const codepointTitle = `U+${data.codePoint.toString(16).toUpperCase()}`;

  return (
    <BaseDialog
      title={codepointTitle}
      open={true}
      onOpenChange={handleClose}
      descriptionId="codepoint-description"
    >
      <div className={styles.dialogWrapper} id="codepoint-description">
        <div className={styles.charDisplay}>{data.originalChar}</div>
        <div className={styles.indexText}>
          {unicodeInfo && (
            <>
              <div><strong>{unicodeInfo.long}</strong></div>
              <div>Short Name: {unicodeInfo.short}</div>
              <div>Category: {unicodeInfo.category}</div>
              <div>Script: {unicodeInfo.script}</div>
            </>
          )}
          <div>Index: {data.position}</div>
        </div>
        <div className={styles.buttonRow}>
          <button
            onClick={copyToClipboard}
            className={styles.iconButton}
            title="Copy character"
          >
            <Icon icon="mdi:content-copy" />
          </button>
          <Dialog.Close asChild>
            <button
              onClick={() => {
                shouldDeleteRef.current = true;
              }}
              className={styles.iconButton}
              title="Delete character"
            >
              <Icon icon="mdi:trash-can-outline" />
            </button>
          </Dialog.Close>
        </div>

        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleClose();
            }
          }}
          placeholder="e.g., U+202F"
          className={styles.inputField}
        />

        <a
          href={unicodeLink}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          More info
        </a>
      </div>
    </BaseDialog>
  );
}
