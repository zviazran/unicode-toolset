import { useState, useEffect, useRef, useMemo } from 'react';
import BaseDialog from '../../components/BaseDialog';
import * as Dialog from '@radix-ui/react-dialog';
import { Icon } from '@iconify/react';
import styles from './CodepointDialog.module.css';
import useUnicodeData from "../../hooks/useUnicodeData";
import useConfusables from "../../hooks/useConfusables";

export default function CodepointDialog({
  data,
  onClose,
  fontFamily
}: {
  data: { codePoint: number; position: number; originalChar: string } | null;
  onClose: (newChar?: string) => void;
  fontFamily?: string;
}) {
  const [inputValue, setInputValue] = useState("");
  const shouldDeleteRef = useRef(false);
  const { getEntry } = useUnicodeData();
  const unicodeInfo = data ? getEntry(data.codePoint) : null;

  const { data: confusablesMap, getConfusablesFor } = useConfusables();

  const confusableInfos = useMemo(() => {
    if (!data || !confusablesMap) return [];
    const chars = getConfusablesFor ? getConfusablesFor(data.originalChar) : [];
    return chars.map(char => ({
      char,
      info: getEntry(char.codePointAt(0)!)
    }));
  }, [data?.originalChar, confusablesMap, getConfusablesFor]);

  useEffect(() => {
    if (data) {
      const hex = data.codePoint.toString(16).toUpperCase().padStart(4, "0");
      setInputValue(`U+${hex}`);
      shouldDeleteRef.current = false;
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

  return (
    <BaseDialog
      open={true}
      onOpenChange={handleClose}
    >
      <div className={styles.dialogWrapper} style={{ fontFamily: `${fontFamily}` }}>
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
        <div className={styles.charDisplay}>{data.originalChar}</div>

        <div className={styles.charInfoTableWrapper}>
          <table className={styles.charInfoTable}>
            <tbody>
              {unicodeInfo && (
                <>
                  <tr>
                    <td colSpan={2} className={styles.charInfoTitle}>
                      {unicodeInfo.long}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ whiteSpace: 'nowrap' }}>Short Name</td>
                    <td>{unicodeInfo.short}</td>
                  </tr>
                  <tr>
                    <td>Category</td>
                    <td>{unicodeInfo.category}</td>
                  </tr>
                  <tr>
                    <td>Script</td>
                    <td>{unicodeInfo.script}</td>
                  </tr>
                </>
              )}
              <tr>
                <td>Index</td>
                <td>{data.position}</td>
              </tr>
            </tbody>
          </table>
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

        {confusableInfos.length > 0 && (
          <div className={styles.confusableList}>
            {confusableInfos.length > 0 && (
              <div>Replace with:</div>
            )}
            <div className={styles.confusableButtons}>
              {confusableInfos.map(({ char, info }) => (
                <button
                  key={char}
                  onClick={() => onClose(char)}
                  className={styles.confusableButton}
                  title={
                    info
                      ? `${info.long} (U+${char.codePointAt(0)!.toString(16).toUpperCase()})`
                      : 'Unknown'
                  }
                >
                  {char}
                </button>
              ))}
            </div>
          </div>
        )}

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
