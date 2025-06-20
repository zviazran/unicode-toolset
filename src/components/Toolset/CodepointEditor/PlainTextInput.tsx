import { useRef, useEffect, useState } from "react";
import styles from "./PlainTextInput.module.css";
import CollapsibleToolbar from "./CollapsibleToolbar";
import DirectionIcon from "../../../assets/icons/DirectionIcon";
import { Icon } from "@iconify/react";

interface Props {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  value: string;
  onChange: (newText: string) => void;
  placeholder?: string;
  isTagTyping?: boolean;
  onSelectionChange?: (start: number, end: number) => void;
}

export default function PlainTextInput({
  value,
  onChange,
  placeholder,
  isTagTyping = false,
  onSelectionChange,
  textareaRef,
}: Props) {
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [direction, setDirection] = useState<"auto" | "ltr" | "rtl">("auto");
  const [fontSize, setFontSize] = useState(16);

  const applyText = (newText: string, pushToUndo = true) => {
    if (pushToUndo) {
      undoStack.current.push(value);
      redoStack.current = []; // Clear redo on new input
    }
    setCanUndo(undoStack.current.length > 0);
    setCanRedo(redoStack.current.length > 0);
    onChange(newText);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    if (!isTagTyping) {
      applyText(newValue);
      return;
    }

    const oldValue = value;
    const diff = newValue.length - oldValue.length;
    const cursorPosition = e.target.selectionStart;

    if (diff <= 0) {
      applyText(newValue);
      return;
    }

    const inserted = newValue.slice(cursorPosition - diff, cursorPosition);

    const tagVersion = Array.from(inserted)
      .filter((char) => /^[a-zA-Z0-9 !@#$%^&*()]$/.test(char))
      .map((char) => String.fromCodePoint(0xe0000 + char.charCodeAt(0)))
      .join("");

    const updated =
      newValue.slice(0, cursorPosition - diff) +
      tagVersion +
      newValue.slice(cursorPosition);

    applyText(updated);

    setTimeout(() => {
      const node = textareaRef.current;
      if (node) {
        const pos = cursorPosition - diff + tagVersion.length;
        node.selectionStart = node.selectionEnd = pos;
      }
    }, 0);
  };

  const handleUndo = () => {
    if (undoStack.current.length === 0) return;
    const prev = undoStack.current.pop()!;
    redoStack.current.push(value);
    onChange(prev);
    setCanUndo(undoStack.current.length > 0);
    setCanRedo(true);
  };

  const handleRedo = () => {
    if (redoStack.current.length === 0) return;
    const next = redoStack.current.pop()!;
    undoStack.current.push(value);
    onChange(next);
    setCanUndo(true);
    setCanRedo(redoStack.current.length > 0);
  };

  useEffect(() => {
    const handleSelect = () => {
      const node = textareaRef.current;
      if (!node) return;

      const start = node.selectionStart ?? -1;
      const end = node.selectionEnd ?? -1;
      onSelectionChange?.(start, end);
    };

    document.addEventListener("selectionchange", handleSelect);
    return () => {
      document.removeEventListener("selectionchange", handleSelect);
    };
  }, [onSelectionChange]);

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
  }, []);

  // Whenever direction state changes, apply it to the DOM
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.dir = direction;
    }
  }, [direction]);

  return (
    <div className={styles.wrapper}>
      <CollapsibleToolbar>
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          className={styles.toolbarButton}
          title="Undo"
        >
          <Icon icon="tabler:arrow-back-up" className={styles.toolbarIcon} />
        </button>
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          className={styles.toolbarButton}
          title="Redo"
        >
          <Icon icon="tabler:arrow-forward-up" className={styles.toolbarIcon} />
        </button>
        <button
          onClick={() => applyText("")}
          className={styles.toolbarButton}
          title="Clear"
        >
          <Icon icon="mdi:delete-outline" className={styles.toolbarIcon} />
        </button>

        <button
          onClick={() =>
            setDirection((prev) =>
              prev === "auto" ? "ltr" : prev === "ltr" ? "rtl" : "auto"
            )
          }
          className={styles.toolbarButton}
          style={{ transform: "translateY(2px)" }}
          title={`Direction: ${direction.toUpperCase()} (click to change)`}
        >
          <DirectionIcon direction={direction} className={styles.toolbarIcon} />
        </button>

        <select
          className={styles.toolbarButton}
          style={{ transform: "translateY(2px)", padding: 0 }}
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          title="Font size"
        >
          {[12, 14, 16, 18, 20, 24, 28, 36, 48, 72, 100, 120].map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </select>
      </CollapsibleToolbar>

      <textarea
        ref={textareaRef}
        className={styles.textarea}
        style={{ fontSize: `${fontSize}px` }}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </div>
  );
}
