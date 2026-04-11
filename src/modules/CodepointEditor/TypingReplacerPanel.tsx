import React from "react";
import styles from "./TypingReplacerPanel.module.css";
import { ReplacementSet } from "../../utils/TypingReplacer";

type TypingReplacerPanelProps = {
  typingReplacerSets: ReplacementSet[];
  enabledTypingReplacerSetIds: string[];
  toggleTypingReplacerSet: (setId: string) => void;
};

const TypingReplacerPanel: React.FC<TypingReplacerPanelProps> = ({
  typingReplacerSets,
  enabledTypingReplacerSetIds,
  toggleTypingReplacerSet,
}) => {
  return (
    <div className={styles.typingReplacerPanel}>
      {typingReplacerSets.length === 0 ? (
        <div className={styles.noSetsMessage}>
          No replacement sets found. Use the Typing Replacer page to add sets.
        </div>
      ) : (
        <div className={styles.typingReplacerCheckboxList}>
          {typingReplacerSets.map((set) => (
            <label key={set.id} className={styles.typingReplacerCheckboxRow}>
              <input
                type="checkbox"
                checked={enabledTypingReplacerSetIds.includes(set.id)}
                onChange={() => toggleTypingReplacerSet(set.id)}
              />
              <span>{set.title}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default TypingReplacerPanel;
