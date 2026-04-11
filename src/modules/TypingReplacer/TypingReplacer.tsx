import { useEffect, useState } from "react";
import styles from "./TypingReplacer.module.css";
import { createReplacementSet, loadTypingReplacerState, saveTypingReplacerState, ReplacementSet } from "../../utils/TypingReplacer";

type ReplacementRow = {
  id: string;
  from: string;
  to: string;
};

type LocalReplacementSet = Omit<ReplacementSet, "map"> & {
  rows: ReplacementRow[];
};

const TypingReplacer: React.FC = () => {
  const initialState = loadTypingReplacerState();
  const [state, setState] = useState<LocalReplacementSet[]>(
    initialState.sets.map((set) => {
      const { map, ...rest } = set;
      return {
        ...rest,
        rows: Object.entries(map).map(([from, to], index) => ({
          id: `${set.id}-row-${index}`,
          from,
          to,
        })),
      };
    })
  );

  useEffect(() => {
    saveTypingReplacerState({
      sets: state.map((set) => ({
        id: set.id,
        title: set.title,
        enabled: set.enabled,
        priority: set.priority,
        map: set.rows.reduce<Record<string, string>>((acc, row) => {
          if (row.from) acc[row.from] = row.to;
          return acc;
        }, {}),
      })),
    });
  }, [state]);

  const addSet = () => {
    const { map, ...newSet } = createReplacementSet();
    setState((prev) => ([
      ...prev,
      {
        ...newSet,
        rows: [],
      },
    ]));
  };

  const deleteSet = (id: string) => {
    setState((prev) => prev.filter((set) => set.id !== id));
  };

  const applyReplacementMap = (text: string, rows: ReplacementRow[]) => {
    const keys = rows
      .filter((row) => row.from)
      .map((row) => row.from)
      .sort((a, b) => b.length - a.length);

    return keys.reduce((current, key) => {
      const replacement = rows.find((row) => row.from === key)?.to ?? "";
      return current.split(key).join(replacement);
    }, text);
  };

  const updateSetTitle = (id: string, title: string) => {
    setState((prev) =>
      prev.map((set) => {
        if (set.id !== id) return set;
        const newTitle = set.enabled ? applyReplacementMap(title, set.rows) : title;
        return { ...set, title: newTitle };
      })
    );
  };

  const toggleSetEnabled = (id: string) => {
    setState((prev) =>
      prev.map((set) =>
        set.id === id ? { ...set, enabled: !set.enabled } : set
      )
    );
  };

  const addMappingRow = (id: string) => {
    setState((prev) =>
      prev.map((set) =>
        set.id !== id
          ? set
          : {
              ...set,
              rows: [
                ...set.rows,
                {
                  id: `${set.id}-row-${Math.random().toString(36).slice(2, 11)}`,
                  from: "",
                  to: "",
                },
              ],
            }
      )
    );
  };

  const updateMapping = (
    setId: string,
    rowId: string,
    newFrom: string,
    newTo: string
  ) => {
    setState((prev) =>
      prev.map((set) => {
        if (set.id !== setId) return set;
        return {
          ...set,
          rows: set.rows.map((row) =>
            row.id !== rowId
              ? row
              : {
                  ...row,
                  from: newFrom,
                  to: newTo,
                }
          ),
        };
      })
    );
  };

  const deleteMapping = (setId: string, rowId: string) => {
    setState((prev) =>
      prev.map((set) => {
        if (set.id !== setId) return set;
        return {
          ...set,
          rows: set.rows.filter((row) => row.id !== rowId),
        };
      })
    );
  };

  return (
    <div className={styles.typingReplacer}>
      <div className={styles.typingReplacerHeader}>
        <div>
          <h1>Typing Replacer</h1>
          <p>
            Create and manage replacements that will be applied while typing.
            Use the checkbox to enable or disable each set. Stored in local browser memory only.
          </p>
        </div>
        <div className={styles.typingReplacerHeaderButtons}>
          <button className={styles.addSetButton} onClick={addSet}>
            Add replacement set
          </button>
        </div>
      </div>

      {state.length === 0 ? (
        <div className={styles.noSetsMessage}>
          No replacement sets yet. Add one to get started.
        </div>
      ) : (
        state.map((set) => (
          <div key={set.id} className={styles.replacementSetCard}>
            <div className={styles.replacementCardTitle}>
              <input
                className={styles.replacementTitleInput}
                value={set.title}
                onChange={(e) => updateSetTitle(set.id, e.target.value)}
                placeholder="Set title"
              />
              <div className={styles.setControls}>
                <label>
                  <input
                    type="checkbox"
                    checked={set.enabled}
                    onChange={() => toggleSetEnabled(set.id)}
                  />
                  Enabled
                </label>
                <button
                  className={styles.smallButton}
                  onClick={() => deleteSet(set.id)}
                >
                  Delete set
                </button>
              </div>
            </div>

            <table className={styles.mappingsTable}>
              <thead>
                <tr>
                  <th>Replace</th>
                  <th>With</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {set.rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <input
                        className={styles.mappingInput}
                        value={row.from}
                        onChange={(e) => updateMapping(set.id, row.id, e.target.value, row.to)}
                        placeholder="from"
                      />
                    </td>
                    <td>
                      <input
                        className={styles.mappingInput}
                        value={row.to}
                        onChange={(e) => updateMapping(set.id, row.id, row.from, e.target.value)}
                        placeholder="to"
                      />
                    </td>
                    <td>
                      <button
                        className={styles.mappingRowButton}
                        onClick={() => deleteMapping(set.id, row.id)}
                        title="Remove mapping"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              className={styles.addMappingButton}
              onClick={() => addMappingRow(set.id)}
            >
              Add mapping
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default TypingReplacer;
