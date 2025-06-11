import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./CollapsiblePanel.module.css";

interface CollapsiblePanelProps {
  title: string;
  children: React.ReactNode;
  queryKey: string;
  onToggle?: (key: string, open: boolean) => void;
}

export default function CollapsiblePanel({
  title,
  children,
  queryKey,
  onToggle,
}: CollapsiblePanelProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const open = params.get(queryKey) === "1";
    setIsOpen(open);
    onToggle?.(queryKey, open);
  }, [location.search, queryKey]);

  const togglePanel = () => {
    const nowOpen = !isOpen;
    const params = new URLSearchParams(location.search);
    if (nowOpen) {
      params.set(queryKey, "1");
    } else {
      params.delete(queryKey);
    }
    navigate({ search: params.toString() }, { replace: true });
    setIsOpen(nowOpen);
    onToggle?.(queryKey, nowOpen); 
  };

  return (
    <div className={styles.panel}>
      <button className={styles.header} onClick={togglePanel}>
        {title} <span className={styles.icon}>{isOpen ? "▲" : "▼"}</span>
      </button>
      <div className={styles.content} style={{ display: isOpen ? "block" : "none" }}>
        {children}
      </div>
    </div>
  );
}

