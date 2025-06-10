import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./CollapsiblePanel.module.css";

interface CollapsiblePanelProps {
  title: string;
  children: React.ReactNode;
  queryKey: string;
}

export default function CollapsiblePanel({ title, children, queryKey }: CollapsiblePanelProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setIsOpen(params.get(queryKey) === "1");
  }, [location.search, queryKey]);

  const togglePanel = () => {
    const params = new URLSearchParams(location.search);
    const nowOpen = !isOpen;
    if (nowOpen) {
      params.set(queryKey, "1");
    } else {
      params.delete(queryKey);
    }
    navigate({ search: params.toString() }, { replace: true });
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
