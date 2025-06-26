import { useState } from "react";
import styles from "./CollapsibleToolbar.module.css";

interface CollapsibleToolbarProps {
  children: React.ReactNode;
}

export default function CollapsibleToolbar({
  children,
}: CollapsibleToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.toolbar}>
      <button className={styles.button} onClick={() => setIsOpen((isOpen) => !isOpen)}>
        <div className={styles.handle} />
      </button>
      <div className={styles.content} style={{ display: isOpen ? "block" : "none" }}>
        {children}
      </div>
    </div>
  );
}

