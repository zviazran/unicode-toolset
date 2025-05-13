import { ReactNode, useState } from "react";
import styles from "./CollapsiblePanel.module.css";

interface CollapsiblePanelProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function CollapsiblePanel({
  title,
  children,
  defaultOpen = false,
}: CollapsiblePanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={styles.panel}>
      <button className={styles.header} onClick={() => setIsOpen((prev) => !prev)}>
        {title} <span className={styles.icon}>{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && <div className={styles.content}>{children}</div>}
    </div>
  );
}
