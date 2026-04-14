import { useContext, useEffect, useMemo, useState } from "react";
import { LanguageContext } from "@/App";

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
  "Mazais kebabs": {
    en: "Small kebab",
    ru: "Маленький кебаб",
    uk: "Малий кебаб",
  },
  "Mini kebabs": {
    en: "Mini kebab",
    ru: "Мини-кебаб",
    uk: "Міні-кебаб",
  },
  "Kebaba šķīvis": {
    en: "Kebab plate",
    ru: "Кебаб на тарелке",
    uk: "Кебаб на тарілці",
  },
  "Kebabs lavašā": {
    en: "Kebab wrap",
    ru: "Кебаб в лаваше",
    uk: "Кебаб у лаваші",
  },

  "Liellopa gaļa": {
    en: "Beef",
    ru: "Говядина",
    uk: "Яловичина",
  },
  "Vistas gaļa": {
    en: "Chicken",
    ru: "Курица",
    uk: "Курка",
  },
  "Mix gaļa": {
    en: "Mixed meat",
    ru: "Смешанное мясо",
    uk: "Змішане м’ясо",
  },
  "Liellopa gaļa + siers": {
    en: "Beef + cheese",
    ru: "Говядина + сыр",
    uk: "Яловичина + сир",
  },
  "Vistas gaļa + siers": {
    en: "Chicken + cheese",
    ru: "Курица + сыр",
    uk: "Курка + сир",
  },
  "Mix gaļa + siers": {
    en: "Mixed meat + cheese",
    ru: "Смешанное мясо + сыр",
    uk: "Змішане м’ясо + сир",
  },
  "Liellopa gaļa + frī": {
    en: "Beef + fries",
    ru: "Говядина + картофель фри",
    uk: "Яловичина + картопля фрі",
  },
  "Vistas gaļa + frī": {
    en: "Chicken + fries",
    ru: "Курица + картофель фри",
    uk: "Курка + картопля фрі",
  },
  "Mix gaļa + frī": {
    en: "Mixed meat + fries",
    ru: "Смешанное мясо + картофель фри",
    uk: "Змішане м’ясо + картопля фрі",
  },
  "Liellopa gaļa + rīsi": {
    en: "Beef + rice",
    ru: "Говядина + рис",
    uk: "Яловичина + рис",
  },
  "Vistas gaļa + rīsi": {
    en: "Chicken + rice",
    ru: "Курица + рис",
    uk: "Курка + рис",
  },
  "Mix gaļa + rīsi": {
    en: "Mixed meat + rice",
    ru: "Смешанное мясо + рис",
    uk: "Змішане м’ясо + рис",
  },

  "Liels Iskender kebabs ar liellopa gaļu.": {
    en: "Large Iskender kebab with beef.",
    ru: "Большой искендер-кебаб с говядиной.",
    uk: "Великий іскендер-кебаб з яловичиною.",
  },
  "Liels Iskender kebabs ar vistas gaļu.": {
    en: "Large Iskender kebab with chicken.",
    ru: "Большой искендер-кебаб с курицей.",
    uk: "Великий іскендер-кебаб з куркою.",
  },
  "Liels Iskender kebabs ar mix gaļu.": {
    en: "Large Iskender kebab with mixed meat.",
    ru: "Большой искендер-кебаб со смешанным мясом.",
    uk: "Великий іскендер-кебаб зі змішаним м’ясом.",
  },
  "Liels kebabs pitā ar liellopa gaļu.": {
    en: "Large pita kebab with beef.",
    ru: "Большой кебаб в пите с говядиной.",
    uk: "Великий кебаб у піті з яловичиною.",
  },
  "Liels kebabs pitā ar vistas gaļu.": {
    en: "Large pita kebab with chicken.",
    ru: "Большой кебаб в пите с курицей.",
    uk: "Великий кебаб у піті з куркою.",
  },
  "Liels kebabs pitā ar mix gaļu.": {
    en: "Large pita kebab with mixed meat.",
    ru: "Большой кебаб в пите со смешанным мясом.",
    uk: "Великий кебаб у піті зі змішаним м’ясом.",
  },
  "Liels kebabs pitā ar liellopa gaļu un frī kartupeļiem.": {
    en: "Large pita kebab with beef and fries.",
    ru: "Большой кебаб в пите с говядиной и картофелем фри.",
    uk: "Великий кебаб у піті з яловичиною та картоплею фрі.",
  },
  "Liels kebabs pitā ar vistas gaļu un frī kartupeļiem.": {
    en: "Large pita kebab with chicken and fries.",
    ru: "Большой кебаб в пите с курицей и картофелем фри.",
    uk: "Великий кебаб у піті з куркою та картоплею фрі.",
  },
  "Liels kebabs pitā ar mix gaļu un frī kartupeļiem.": {
    en: "Large pita kebab with mixed meat and fries.",
    ru: "Большой кебаб в пите со смешанным мясом и картофелем фри.",
    uk: "Великий кебаб у піті зі змішаним м’ясом та картоплею фрі.",
  },
  "Liels kebabs lavašā ar liellopa gaļu.": {
    en: "Large kebab wrap with beef.",
    ru: "Большой кебаб в лаваше с говядиной.",
    uk: "Великий кебаб у лаваші з яловичиною.",
  },
  "Liels kebabs lavašā ar vistas gaļu.": {
    en: "Large kebab wrap with chicken.",
    ru: "Большой кебаб в лаваше с курицей.",
    uk: "Великий кебаб у лаваші з куркою.",
  },
  "Liels kebabs lavašā ar mix gaļu.": {
    en: "Large kebab wrap with mixed meat.",
    ru: "Большой кебаб в лаваше со смешанным мясом.",
    uk: "Великий кебаб у лаваші зі змішаним м’ясом.",
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
};

const memoryCache = new Map<string, string>();
const LS_PREFIX = "tr_v9_";

function normalizeTexts(texts: string[]) {
  return texts.map((text) => String(text ?? "").trim());
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function cacheKey(text: string, lang: string): string {
  return `${text}::${lang}`;
}

function getLsKey(text: string, lang: string): string {
  return LS_PREFIX + simpleHash(`${text}::${lang}`);
}

function getCached(text: string, lang: string): string | null {
  const key = cacheKey(text, lang);

  if (memoryCache.has(key)) {
    return memoryCache.get(key) || null;
  }

  try {
    const stored = localStorage.getItem(getLsKey(text, lang));
    if (stored) {
      memoryCache.set(key, stored);
      return stored;
    }
  } catch {
    //
  }

  return null;
}

function setCache(text: string, lang: string, translated: string) {
  const key = cacheKey(text, lang);
  memoryCache.set(key, translated);

  try {
    localStorage.setItem(getLsKey(text, lang), translated);
  } catch {
    //
  }
}

function mapLangCode(lang: string): SupportedLang {
  if (lang === "ua") return "uk";
  if (lang === "lv" || lang === "en" || lang === "ru" || lang === "uk") return lang;
  return "en";
}

function shouldSkipTranslation(text: string): boolean {
  const trimmed = String(text || "").trim();
  if (!trimmed) return true;
  if (/^[\d\s.,:;€$£\-–/()+]+$/.test(trimmed)) return true;
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
  return MANUAL_TRANSLATIONS[trimmed]?.[lang] || null;
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
  if (/[ІіЇїЄєҐґ]/.test(trimmed)) return "uk";
  if (/[А-Яа-яЁё]/.test(trimmed)) return "ru";
  if (looksMostlyEnglish(trimmed)) return "en";

  return "lv";
}

async function translateBatchWithSource(
  batch: string[],
  sourceLang: string,
  targetLang: SupportedLang,
): Promise<string[] | null> {
  if (!GOOGLE_TRANSLATE_API_KEY) {
    return null;
  }

  const params = new URLSearchParams();
  params.set("key", GOOGLE_TRANSLATE_API_KEY);
  params.set("source", sourceLang);
  params.set("target", targetLang);
  params.set("format", "text");
  batch.forEach((text) => params.append("q", text));

  const res = await fetch(`${TRANSLATE_URL}?${params.toString()}`, {
    method: "POST",
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    console.error("Translation API error:", res.status, errorText);
    return null;
  }

  const json = await res.json().catch(() => null);
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

async function translateWithPublicFallback(texts: string[], targetLang: SupportedLang): Promise<string[]> {
  if (!texts.length) return texts;

  const CHUNK_SIZE = 12;
  const DELIMITER = " ||| ";
  const results: string[] = [];

  for (let i = 0; i < texts.length; i += CHUNK_SIZE) {
    const chunk = texts.slice(i, i + CHUNK_SIZE);
    const joined = chunk.join(DELIMITER);

    const url =
      `https://translate.googleapis.com/translate_a/single` +
      `?client=gtx&sl=auto&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(joined)}`;

    try {
      const response = await fetch(url, { cache: "no-store" });
      const data: unknown = await response.json().catch(() => null);

      if (!response.ok || !Array.isArray(data) || !Array.isArray(data[0])) {
        console.error("Fallback translation API error:", {
          status: response.status,
          statusText: response.statusText,
          data,
        });
        results.push(...chunk);
        continue;
      }

      const translatedJoined = (data[0] as unknown[])
        .map((segment) => {
          if (!Array.isArray(segment)) return "";
          return String(segment[0] ?? "");
        })
        .join("");

      const translatedChunk = translatedJoined
        .split(DELIMITER)
        .slice(0, chunk.length)
        .map((value) => decodeHtmlEntities(value));

      if (translatedChunk.length !== chunk.length) {
        results.push(...chunk);
        continue;
      }

      results.push(...translatedChunk);
    } catch (error) {
      console.error("Fallback translation chunk failed:", error);
      results.push(...chunk);
    }
  }

  return results;
}

export async function batchTranslate(texts: string[], targetLang: string): Promise<string[]> {
  const safeTexts = normalizeTexts(texts);
  const apiLang = mapLangCode(targetLang);

  if (!safeTexts.length) return safeTexts;

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

    const detected = detectSourceLang(text);
    if (detected === apiLang) {
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
    const BATCH_SIZE = 50;

    if (GOOGLE_TRANSLATE_API_KEY) {
      for (const [sourceLang, uniqueTexts] of sourceBuckets.entries()) {
        for (let i = 0; i < uniqueTexts.length; i += BATCH_SIZE) {
          const batch = uniqueTexts.slice(i, i + BATCH_SIZE);
          const translatedBatch = await translateBatchWithSource(batch, sourceLang, apiLang);

          if (!translatedBatch) {
            continue;
          }

          batch.forEach((originalText, index) => {
            const decoded = translatedBatch[index] || originalText;
            translatedMap.set(originalText, decoded);
            setCache(originalText, apiLang, decoded);
          });
        }
      }
    }

    const stillMissing = uncached.map((item) => item.text).filter((text) => !translatedMap.has(text));

    if (stillMissing.length) {
      const fallbackTranslated = await translateWithPublicFallback(stillMissing, apiLang);

      stillMissing.forEach((originalText, index) => {
        const translated = fallbackTranslated[index] || originalText;
        translatedMap.set(originalText, translated);
        setCache(originalText, apiLang, translated);
      });
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

export function useTranslatedTexts(texts: string[]) {
  const { lang } = useContext(LanguageContext);
  const [translatedTexts, setTranslatedTexts] = useState<string[]>([]);

  const normalizedTexts = useMemo(() => normalizeTexts(texts), [texts]);

  // Reset translations immediately when language changes to prevent mixed languages
  useEffect(() => {
    setTranslatedTexts([]);
  }, [lang]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!normalizedTexts.length) {
        setTranslatedTexts([]);
        return;
      }

      if (lang === "lv") {
        setTranslatedTexts(normalizedTexts);
        return;
      }

      try {
        const translated = await batchTranslate(normalizedTexts, lang);

        if (!cancelled) {
          setTranslatedTexts(translated);
        }
      } catch (error) {
        console.error("Translation hook failed:", error);
        if (!cancelled) {
          setTranslatedTexts(normalizedTexts);
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [lang, normalizedTexts]);

  // While translations are loading, return original texts (LV) instead of stale translations
  return translatedTexts.length === normalizedTexts.length ? translatedTexts : normalizedTexts;
}
