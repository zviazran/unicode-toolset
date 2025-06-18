import { useRef, useEffect } from "react";
import styles from "./PlainTextInput.module.css";
import CollapsibleToolbar from "./CollapsibleToolbar";
import { Icon } from "@iconify/react";

interface Props {
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
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    if (!isTagTyping) {
      onChange(newValue);
      return;
    }

    const oldValue = value;
    const diff = newValue.length - oldValue.length;
    const cursorPosition = e.target.selectionStart;

    if (diff <= 0) {
      onChange(newValue);
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

    onChange(updated);

    setTimeout(() => {
      const node = textareaRef.current;
      if (node) {
        const pos = cursorPosition - diff + tagVersion.length;
        node.selectionStart = node.selectionEnd = pos;
      }
    }, 0);
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

  return (
    <div className={styles.wrapper}>
      <CollapsibleToolbar>
        <button onClick={() => onChange("")} className={styles.toolbarButton} title="Clear text">
          <Icon icon="mdi:delete-outline" className={styles.toolbarIcon} />
        </button>
      </CollapsibleToolbar>

      <textarea
        ref={textareaRef}
        className={styles.textarea}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </div>
  );
}
