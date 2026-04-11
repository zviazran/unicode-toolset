export type ReplacementSet = {
  id: string;
  title: string;
  map: Record<string, string>;
  enabled: boolean;
  priority?: number;
};

export type TypingReplacerState = {
  sets: ReplacementSet[];
};

const STORAGE_KEY = "typing-replacer-state";

const DEFAULT_STATE: TypingReplacerState = {
  sets: [
    {
      id: "typing-replacer-default",
      title: "Default replacennent set",
      map: {
        m: "nn",
        I: "l",
      },
      enabled: true,
      priority: 0,
    },
    {
      id: "leet",
      title: "Leetspeak",
      map: {
       a: "4",
       e: "3",
       o: "0"
      },
      enabled: true,
    },
  ],
};

export function loadTypingReplacerState(): TypingReplacerState {
  if (typeof window === "undefined" || !window.localStorage) {
    return DEFAULT_STATE;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_STATE;
    const parsed = JSON.parse(stored) as unknown;
    if (!parsed || typeof parsed !== "object") return DEFAULT_STATE;

    const parsedState = parsed as any;
    if (!Array.isArray(parsedState.sets)) return DEFAULT_STATE;

    const migratedSets = parsedState.sets.map((set: any, setIndex: number) => {
      const map: Record<string, string> = {};

      if (Array.isArray(set.rows)) {
        (set.rows as any[])
          .filter((row: any) => row && typeof row.from === "string" && typeof row.to === "string")
          .forEach((row: any) => {
            map[row.from] = row.to;
          });
      }

      if (set.map && typeof set.map === "object") {
        Object.entries(set.map)
          .filter(([from]) => typeof from === "string")
          .forEach(([from, to]) => {
            map[from] = typeof to === "string" ? to : "";
          });
      }

      return {
        id: set.id || `typing-replacer-${setIndex}`,
        title: set.title || "Untitled replacement",
        map,
        enabled: Boolean(set.enabled),
        priority: typeof set.priority === "number" ? set.priority : 0,
      };
    });

    return { sets: migratedSets };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveTypingReplacerState(state: TypingReplacerState) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

export function createReplacementSet(): ReplacementSet {
  return {
    id: `typing-replacer-${Math.random().toString(36).slice(2, 11)}`,
    title: "Untitled replacement",
    map: {},
    enabled: true,
    priority: 0,
  };
}

export function buildTypingReplacerMap(sets: ReplacementSet[], enabledIds: string[]): Record<string, string> {
  const activeIds = new Set(enabledIds);
  const activeSets = sets
    .filter((set) => activeIds.has(set.id))
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

  return activeSets.reduce<Record<string, string>>((acc, set) => {
    for (const [from, to] of Object.entries(set.map)) {
      if (!from || from.startsWith("__typing_replacer_empty__")) continue;
      acc[from] = to;
    }
    return acc;
  }, {});
}

export function applyTypingReplacements(text: string, typingReplacerMappings: Record<string, string>): string {
  const mappingKeys = Object.keys(typingReplacerMappings || {}).filter((key) => key.length > 0);
  if (!mappingKeys.length) return text;

  const sortedKeys = mappingKeys.sort((a, b) => b.length - a.length);
  let result = text;
  for (const key of sortedKeys) {
    result = result.split(key).join(typingReplacerMappings[key]);
  }
  return result;
}

export function buildActiveReplacementMap(state: TypingReplacerState): Record<string, string> {
  const activeSets = [...state.sets]
    .filter((set) => set.enabled)
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

  return activeSets.reduce<Record<string, string>>((acc, set) => {
    for (const [from, to] of Object.entries(set.map)) {
      if (!from || from.startsWith("__typing_replacer_empty__")) continue;
      acc[from] = to;
    }
    return acc;
  }, {});
}
