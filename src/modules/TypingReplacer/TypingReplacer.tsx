import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import styles from "./TypingReplacer.module.css";
import { createReplacementSet, getDefaultTypingReplacerState, loadTypingReplacerState, saveTypingReplacerState, ReplacementSet } from "../../utils/TypingReplacer";

type ReplacementRow = {
  id: string;
  from: string;
  to: string;
};

type LocalReplacementSet = Omit<ReplacementSet, "map"> & {
  rows: ReplacementRow[];
  jsonView?: boolean;
  jsonText?: string;
  jsonError?: string;
};

const TypingReplacer: React.FC = () => {
  const rowsToMap = (rows: ReplacementRow[]) =>
    rows.reduce<Record<string, string>>((acc, row) => {
      if (row.from) acc[row.from] = row.to;
      return acc;
    }, {});

  const mapToRows = (map: Record<string, string>, setId: string) =>
    Object.entries(map).map(([from, to], index) => ({
      id: `${setId}-row-${index}`,
      from,
      to,
    }));

  const getJsonError = (text: string): string => {
    try {
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return "JSON must be an object";
      }

      for (const value of Object.values(parsed)) {
        if (typeof value !== "string") {
          return "All values must be strings";
        }
      }

      return "";
    } catch {
      return "Invalid JSON";
    }
  };

  const createLocalState = (sets: ReplacementSet[]) =>
    sets.map((set) => {
      const { map, ...rest } = set;
      return {
        ...rest,
        rows: Object.entries(map).map(([from, to], index) => ({
          id: `${set.id}-row-${index}`,
          from,
          to,
        })),
      };
    });

  const initialState = loadTypingReplacerState();
  const [state, setState] = useState<LocalReplacementSet[]>(
    createLocalState(initialState.sets)
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
      {
        ...newSet,
        rows: [],
      },
      ...prev,
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
        const newTitle = applyReplacementMap(title, set.rows);
        return { ...set, title: newTitle };
      })
    );
  };

  const toggleJsonView = (id: string) => {
    setState((prev) =>
      prev.map((set) => {
        if (set.id !== id) return set;

        if (!set.jsonView) {
          return {
            ...set,
            jsonView: true,
            jsonText: JSON.stringify(rowsToMap(set.rows), null, 2),
            jsonError: "",
          };
        }

        const jsonText = set.jsonText ?? "";
        const error = getJsonError(jsonText);
        if (error) {
          return {
            ...set,
            jsonError: error,
          };
        }

        const parsed = JSON.parse(jsonText);
        return {
          ...set,
          jsonView: false,
          jsonText: undefined,
          jsonError: undefined,
          rows: mapToRows(parsed as Record<string, string>, set.id),
        };
      })
    );
  };

  const updateJsonText = (id: string, text: string) => {
    setState((prev) =>
      prev.map((set) =>
        set.id !== id
          ? set
          : {
              ...set,
              jsonText: text,
              jsonError: getJsonError(text),
            }
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
      <h1>Typing Replacer</h1>
      <p>
        Create and manage replacements that will be applied while typing in the codepoint editor.<br/>
        Stored in local browser memory only.
      </p>
      <div className={styles.typingReplacerHeaderButtons}>
        <button className={styles.addSetButton} onClick={addSet}>
          Add new replacement set
        </button>
        <button className={styles.smallButton} onClick={() => setState(createLocalState(getDefaultTypingReplacerState().sets))}>
          Restore default sets
        </button>
      </div>

      {state.length === 0 ? (
        <div className={styles.noSetsMessage}>
          No replacement sets yet. Add one to get started.
        </div>
      ) : (
        <div className={styles.replacementSetGrid}>
          {state.map((set) => (
            <div key={set.id} className={styles.replacementSetCard}>
              <div className={styles.replacementCardTitle}>
              <input
                className={styles.replacementTitleInput}
                value={set.title}
                onChange={(e) => updateSetTitle(set.id, e.target.value)}
                placeholder="Set title"
              />
              <div className={styles.setControls}>
                <button
                  className={`${styles.smallButton} ${styles.iconButton}`}
                  onClick={() => toggleJsonView(set.id)}
                  aria-label={set.jsonView ? "Switch to table view" : "Switch to JSON view"}
                  title={set.jsonView ? "Switch to table view" : "Switch to JSON view"}
                >
                  <Icon
                    icon={set.jsonView ? "mdi:table-large" : "mdi:code-json"}
                    width="18"
                  />
                </button>
                <button
                  className={`${styles.smallButton} ${styles.iconButton}`}
                  onClick={() => deleteSet(set.id)}
                  aria-label="Delete set"
                  title="Delete set"
                >
                  <Icon icon="mdi:trash-can-outline" width="18" />
                </button>
              </div>
            </div>

            {set.jsonView ? (
              <div className={styles.jsonEditorWrapper}>
                <textarea
                  className={styles.jsonEditorArea}
                  value={set.jsonText ?? ""}
                  onChange={(e) => updateJsonText(set.id, e.target.value)}
                  placeholder='{ "from": "to" }'
                />
                {set.jsonError ? (
                  <div className={styles.jsonError}>{set.jsonError}</div>
                ) : null}
              </div>
            ) : (
              <div className={styles.mappingsTableWrapper}>
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
                  <tr className={styles.addMappingRow} onClick={() => addMappingRow(set.id)}>
                    <td colSpan={3} className={styles.addMappingCell}>
                      <button
                        className={`${styles.addMappingButton}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          addMappingRow(set.id);
                        }}
                        aria-label="Add mapping"
                        title="Add mapping"
                      >
                        <Icon icon="mdi:plus" width="18" />
                      </button>
                    </td>
                  </tr>
                </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
      )}
    </div>
  );
};

export default TypingReplacer;
