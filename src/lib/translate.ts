const GOOGLE_TRANSLATE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_KEY || "";
const TRANSLATE_URL = "https://translation.googleapis.com/language/translate/v2";

type SupportedLang = "lv" | "en" | "ru" | "uk";

const MANUAL_TRANSLATIONS: Record<string, Partial<Record<SupportedLang, string>>> = {
  "Vistas salāti": {
    en: "Chicken salad",
    ru: "Салат с курицей",
    uk: "Салат з куркою",
  },
  "Klasiskie salāti": {
    en: "Classic salad",
    ru: "Классический салат",
    uk: "Класичний салат",
  },
  "Garneļu salāti": {
    en: "Shrimp salad",
    ru: "Салат с креветками",
    uk: "Салат з креветками",
  },
  "Cēzara salāti": {
    en: "Caesar salad",
    ru: "Салат Цезарь",
    uk: "Салат Цезар",
  },
  "Frī kartupeļi": {
    en: "French fries",
    ru: "Картофель фри",
    uk: "Картопля фрі",
  },
  "Mini burgers": {
    en: "Mini burger",
    ru: "Мини-бургер",
    uk: "Мінібургер",
  },
  "Vistas nageti": {
    en: "Chicken nuggets",
    ru: "Куриные наггетсы",
    uk: "Курячі нагетси",
  },
  "Mazais burgers": {
    en: "Mini burger",
    ru: "Мини-бургер",
    uk: "Мінібургер",
  },
  Mazais: {
    en: "Small",
    ru: "Маленький",
    uk: "Малий",
  },
  Lielais: {
    en: "Large",
    ru: "Большой",
    uk: "Великий",
  },
  Standarta: {
    en: "Standard",
    ru: "Стандарт",
    uk: "Стандарт",
  },

  // reverse fixes, ja source CSV daļēji jau ir EN
  "Chicken nuggets": {
    lv: "Vistas nageti",
    ru: "Куриные наггетсы",
    uk: "Курячі нагетси",
  },
  "French fries": {
    lv: "Frī kartupeļi",
    ru: "Картофель фри",
    uk: "Картопля фрі",
  },
  "Mini burger": {
    lv: "Mini burgers",
    ru: "Мини-бургер",
    uk: "Мінібургер",
  },
  "Chicken salad": {
    lv: "Vistas salāti",
    ru: "Салат с курицей",
    uk: "Салат з куркою",
  },
  "Classic salad": {
    lv: "Klasiskie salāti",
    ru: "Классический салат",
    uk: "Класичний салат",
  },
  "Shrimp salad": {
    lv: "Garneļu salāti",
    ru: "Салат с креветками",
    uk: "Салат з креветками",
  },
  "Caesar salad": {
    lv: "Cēzara salāti",
    ru: "Салат Цезарь",
    uk: "Салат Цезар",
  },
};

const memoryCache = new Map<string, string>();
const LS_PREFIX = "tr_v6_";

function cacheKey(text: string, lang: string): string {
  return `${text}::${lang}`;
}

function getLsKey(text: string, lang: string): string {
  return LS_PREFIX + simpleHash(`${text}::${lang}`);
}

function simpleHash(str: string): string {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash).toString(36);
}

function getCached(text: string, lang: string): string | null {
  const key = cacheKey(text, lang);

  if (memoryCache.has(key)) {
    return memoryCache.get(key)!;
  }

  try {
    const stored = localStorage.getItem(getLsKey(text, lang));

    if (stored) {
      memoryCache.set(key, stored);
      return stored;
    }
  } catch {
    // ignore
  }

  return null;
}

function setCache(text: string, lang: string, translated: string) {
  const key = cacheKey(text, lang);
  memoryCache.set(key, translated);

  try {
    localStorage.setItem(getLsKey(text, lang), translated);
  } catch {
    // ignore
  }
}

function mapLangCode(lang: string): SupportedLang {
  if (lang === "ua") return "uk";
  if (lang === "lv" || lang === "en" || lang === "ru" || lang === "uk") return lang;
  return "en";
}

function shouldSkipTranslation(text: string): boolean {
  const trimmed = (text || "").trim();

  if (!trimmed) return true;
  if (/^[\d\s.,:;€$£\-–/]+$/.test(trimmed)) return true;

  return false;
}

function decodeHtmlEntities(text: string): string {
  if (typeof document === "undefined") return text;

  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

function getManualTranslation(text: string, lang: SupportedLang): string | null {
  const trimmed = text.trim();
  const found = MANUAL_TRANSLATIONS[trimmed]?.[lang];
  return found || null;
}

function looksMostlyEnglish(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  const latinWords = trimmed.match(/[A-Za-z]{2,}/g) || [];
  const lvChars = trimmed.match(/[āčēģīķļņšūž]/gi) || [];
  const cyrillicChars = trimmed.match(/[А-Яа-яЁёІіЇїЄєҐґ]/g) || [];

  if (cyrillicChars.length > 0) return false;
  if (lvChars.length > 0) return false;

  return latinWords.length > 0;
}

function detectSourceLang(text: string): string {
  const trimmed = text.trim();

  if (!trimmed) return "auto";
  if (/[А-Яа-яЁё]/.test(trimmed)) return "ru";
  if (/[ІіЇїЄєҐґ]/.test(trimmed)) return "uk";
  if (looksMostlyEnglish(trimmed)) return "en";

  return "lv";
}

async function translateBatchWithSource(
  batch: string[],
  sourceLang: string,
  targetLang: SupportedLang,
): Promise<string[] | null> {
  if (!GOOGLE_TRANSLATE_API_KEY) {
    console.error("Translation API key is missing. Set VITE_GOOGLE_TRANSLATE_KEY in your .env file.");
    return null;
  }

  const params = new URLSearchParams();
  params.set("key", GOOGLE_TRANSLATE_API_KEY);
  params.set("source", sourceLang);
  params.set("target", targetLang);
  params.set("format", "text");
  batch.forEach((text) => params.append("q", text));

  const res = await fetch(`${TRANSLATE_URL}?${params.toString()}`);

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Translation API error:", res.status, errorText);
    return null;
  }

  const json = await res.json();
  const translations = json?.data?.translations;

  if (!translations || !Array.isArray(translations)) {
    console.error("Unexpected translation response:", json);
    return null;
  }

  return batch.map((originalText, index) => {
    const translated = translations[index]?.translatedText || originalText;
    return decodeHtmlEntities(translated);
  });
}

export async function batchTranslate(texts: string[], targetLang: string): Promise<string[]> {
  const safeTexts = texts.map((t) => t ?? "");
  const apiLang = mapLangCode(targetLang);

  if (safeTexts.length === 0) {
    return safeTexts;
  }

  const results: string[] = [...safeTexts];
  const uncached: { index: number; text: string }[] = [];

  safeTexts.forEach((text, index) => {
    if (shouldSkipTranslation(text)) {
      results[index] = text;
      return;
    }

    const manual = getManualTranslation(text, apiLang);
    if (manual) {
      results[index] = manual;
      setCache(text, apiLang, manual);
      return;
    }

    const cached = getCached(text, apiLang);
    if (cached !== null) {
      results[index] = cached;
      return;
    }

    if (detectSourceLang(text) === apiLang) {
      results[index] = text;
      setCache(text, apiLang, text);
      return;
    }

    uncached.push({ index, text });
  });

  if (!uncached.length) {
    return results;
  }

  const sourceBuckets = new Map<string, string[]>();

  uncached.forEach(({ text }) => {
    const source = detectSourceLang(text);
    const arr = sourceBuckets.get(source) || [];
    if (!arr.includes(text)) arr.push(text);
    sourceBuckets.set(source, arr);
  });

  const translatedMap = new Map<string, string>();

  try {
    const BATCH_SIZE = 100;

    for (const [sourceLang, uniqueTexts] of sourceBuckets.entries()) {
      for (let i = 0; i < uniqueTexts.length; i += BATCH_SIZE) {
        const batch = uniqueTexts.slice(i, i + BATCH_SIZE);

        const translatedBatch = await translateBatchWithSource(batch, sourceLang, apiLang);

        if (!translatedBatch) {
          return safeTexts;
        }

        batch.forEach((originalText, index) => {
          const decoded = translatedBatch[index] || originalText;
          translatedMap.set(originalText, decoded);
          setCache(originalText, apiLang, decoded);
        });
      }
    }

    uncached.forEach(({ index, text }) => {
      results[index] = translatedMap.get(text) || text;
    });

    return results;
  } catch (error) {
    console.error("Translation failed:", error);
    return safeTexts;
  }
}
