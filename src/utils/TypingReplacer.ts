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
      title: "Default replacement set",
      map: {
        a: "а", // Cyrillic a
        b: "Ь", // Cyrillic soft sign
        c: "с", // Cyrillic es
        d: "ԁ", // Cyrillic d
        e: "е", // Cyrillic ie
        f: "ƒ", // Latin f hook
        g: "ɡ", // Latin script g
        h: "һ", // Cyrillic shha
        i: "і", // Cyrillic i
        j: "ј", // Cyrillic je
        k: "κ", // Greek kappa
        l: "ⅼ", // Roman numeral fifty
        m: "ⅿ", // Roman numeral thousand
        n: "ո", // Armenian nu
        o: "ο", // Greek omicron
        p: "р", // Cyrillic er
        q: "ԛ", // Cyrillic qa
        r: "г", // Cyrillic ge
        s: "ѕ", // Cyrillic dze
        t: "т", // Cyrillic te
        u: "υ", // Greek upsilon
        v: "ν", // Greek nu
        w: "ԝ", // Cyrillic we
        x: "х", // Cyrillic ha
        y: "у", // Cyrillic u
        z: "ᴢ", // Latin small capital z

        A: "Α", // Greek alpha
        B: "Β", // Greek beta
        C: "С", // Cyrillic es
        D: "Ꭰ", // Cherokee A
        E: "Ε", // Greek epsilon
        F: "Ϝ", // Greek digamma
        G: "Ԍ", // Cyrillic G
        H: "Η", // Greek eta
        I: "І", // Cyrillic I
        J: "Ј", // Cyrillic Je
        K: "Κ", // Greek kappa
        L: "Ꮮ", // Cherokee L
        M: "Μ", // Greek mu
        N: "Ν", // Greek nu
        O: "Ο", // Greek omicron
        P: "Ρ", // Greek rho
        Q: "Ԛ", // Cyrillic QA
        R: "Ꭱ", // Cherokee R
        S: "Ѕ", // Cyrillic Dze
        T: "Τ", // Greek tau
        U: "Ս", // Armenian se
        V: "Ѵ", // Cyrillic izhitsa
        W: "Ԝ", // Cyrillic we
        X: "Χ", // Greek chi
        Y: "Υ", // Greek upsilon
        Z: "Ζ", // Greek zeta
      },
      enabled: false,
      priority: 0,
    },
    {
      id: "leet",
      title: "Leetspeak",
      map: {
        a: "4",
        b: "8",
        e: "3",
        g: "6",
        i: "1",
        l: "1",
        o: "0",
        s: "5",
        t: "7",
        z: "2"
      },
      enabled: false,
    },
    {
      id: "fakehebrew",
      title: "ਕᑊ ລᕄᑐ ᕄᑊᒉລƔ ᑊᒧƔᑊ",
      map:{
        "א": "ꗪ",
        "ב": "ລ",
        "ג": "ᕍ",
        "ד": "ਕ",
        "ה": "ᘅ",
        "ו": "ꓲ",
        "ז": "ᕊ",
        "ח": "⋂",
        "ט": "ᘎ",
        "י": "ᑊ",
        "כ": "ᑐ",
        "ל": "ᘕ",
        "מ": "ᘞ",
        "נ": "ᒧ",
        "ע": "Ɣ",
        "פ": "ᘐ",
        "צ": "ਤ",
        "ק": "Ꭾ",
        "ר": "ᒉ",
        "ש": "ᘓ",
        "ת": "ᕄ",
        "ם": "ᕵ",
        "ן": "|",
        "ף": "ໃ",
        "ץ": "Ⴥ"
      },
      enabled: false,
    },
  ],
};

export function loadTypingReplacerState(): TypingReplacerState {
  if (typeof window === "undefined" || !window.localStorage) {
    return getDefaultTypingReplacerState();
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

export function getDefaultTypingReplacerState(): TypingReplacerState {
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

export function toggleReplacementSetEnabled(sets: ReplacementSet[], setId: string): ReplacementSet[] {
  return sets.map((set) =>
    set.id === setId ? { ...set, enabled: !set.enabled } : set
  );
}

export function getEnabledReplacementSetIds(sets: ReplacementSet[]): string[] {
  return sets.filter((set) => set.enabled).map((set) => set.id);
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
