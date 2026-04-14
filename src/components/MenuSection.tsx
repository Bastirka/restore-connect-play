import React, { memo, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Utensils } from "lucide-react";
import { LanguageContext } from "@/App";
import { useTranslatedTexts } from "@/hooks/use-translate";

const MENU_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRYKPdl7ZFecNaYuGHbmePFREkzHclGioRQdwEhiDmy_RbvGqiFCuGKz0FOpEDtkXNUE9UEH90PJIOf/pub?gid=1173998322&single=true&output=csv";

const IMAGE_OVERRIDES: Record<string, string> = {
  "mini kebab": "https://i.postimg.cc/ZY71vfxb/Image-17-03-2026-at-18-21-(47).png",
  "mazais kebabs": "https://i.postimg.cc/ZY71vfxb/Image-17-03-2026-at-18-21-(47).png",
};

const translations = {
  lv: {
    title: "Ēdienkarte",
    loading: "Ielādējam ēdienkarti...",
    itemCount: "ēdieni",
    standard: "Standarta",
    categories: {
      kebabi: "Kebabi",
      burgeri: "Burgeri",
      salads: "Salāti",
      dzerieni: "Dzērieni",
      deserti: "Deserti",
      kids: "Bērnu ēdienkarte",
      vegetarian: "Veģetārie ēdieni",
      pide: "Pide",
    },
    placeholderAlt: "Ēdiena attēls",
  },
  en: {
    title: "Menu",
    loading: "Loading menu...",
    itemCount: "dishes",
    standard: "Standard",
    categories: {
      kebabi: "Kebabs",
      burgeri: "Burgers",
      salads: "Salads",
      dzerieni: "Drinks",
      deserti: "Desserts",
      kids: "Kids menu",
      vegetarian: "Vegetarian dishes",
      pide: "Pide",
    },
    placeholderAlt: "Food image",
  },
  ru: {
    title: "Меню",
    loading: "Загружаем меню...",
    itemCount: "блюда",
    standard: "Стандарт",
    categories: {
      kebabi: "Кебабы",
      burgeri: "Бургеры",
      salads: "Салаты",
      dzerieni: "Напитки",
      deserti: "Десерты",
      kids: "Детское меню",
      vegetarian: "Вегетарианские блюда",
      pide: "Пиде",
    },
    placeholderAlt: "Изображение блюда",
  },
  uk: {
    title: "Меню",
    loading: "Завантажуємо меню...",
    itemCount: "страви",
    standard: "Стандарт",
    categories: {
      kebabi: "Кебаби",
      burgeri: "Бургери",
      salads: "Салати",
      dzerieni: "Напої",
      deserti: "Десерти",
      kids: "Дитяче меню",
      vegetarian: "Вегетаріанські страви",
      pide: "Піде",
    },
    placeholderAlt: "Зображення страви",
  },
} as const;

type MenuItem = {
  id: string;
  category: string;
  groupName: string;
  variantName: string;
  description: string;
  price: string;
  image: string;
};

const categoryOrder = ["kebabi", "burgeri", "pide", "salads", "vegetarian", "kids", "dzerieni", "deserti"] as const;

function normalizeText(value: string) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getImageOverride(groupName: string, variantName?: string) {
  const g = normalizeText(groupName || "");
  const v = normalizeText(variantName || "");
  return IMAGE_OVERRIDES[g] || IMAGE_OVERRIDES[v] || "";
}

function optimizeImageUrl(url: string) {
  if (!url) return "";

  try {
    const parsed = new URL(url);
    return parsed.toString();
  } catch {
    return url;
  }
}

function parseCsvLine(line: string) {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result.map((v) => v.replace(/^"|"$/g, ""));
}

function normalizeCategory(category: string) {
  const c = normalizeText(category);

  if (c === "kebabi" || c === "kebabs" || c === "kebab" || c.includes("kebab") || c.includes("кебаб")) {
    return "kebabi";
  }

  if (c === "burgeri" || c === "burgers" || c === "burger" || c.includes("burger") || c.includes("бургер")) {
    return "burgeri";
  }

  if (
    c === "picas" ||
    c === "pizza" ||
    c === "pizzas" ||
    c === "pica" ||
    c.includes("pizza") ||
    c.includes("pica") ||
    c.includes("пиц") ||
    c.includes("піц")
  ) {
    return "picas";
  }

  if (c === "pide" || c.includes("pide") || c.includes("пиде") || c.includes("піде")) {
    return "pide";
  }

  if (
    c === "salads" ||
    c === "salad" ||
    c === "salati" ||
    c === "salatii" ||
    c.includes("salad") ||
    c.includes("salat") ||
    c.includes("салат")
  ) {
    return "salads";
  }

  if (c === "vegetarian" || c.includes("vegetarian") || c.includes("vegetarie") || c.includes("вегет")) {
    return "vegetarian";
  }

  if (
    c === "kids" ||
    c.includes("kids") ||
    c.includes("kid") ||
    c.includes("bernu") ||
    c.includes("дет") ||
    c.includes("дит")
  ) {
    return "kids";
  }

  if (
    c === "dzerieni" ||
    c === "drink" ||
    c === "drinks" ||
    c.includes("drink") ||
    c.includes("dzēr") ||
    c.includes("dzer") ||
    c.includes("напит") ||
    c.includes("напої")
  ) {
    return "dzerieni";
  }

  if (
    c === "deserti" ||
    c === "dessert" ||
    c === "desserts" ||
    c.includes("dessert") ||
    c.includes("desert") ||
    c.includes("десерт")
  ) {
    return "deserti";
  }

  return c;
}

function capitalizeFirst(text: string) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function addPreconnect(url: string) {
  try {
    const origin = new URL(url).origin;

    if (document.querySelector(`link[data-preconnect="${origin}"]`)) return;

    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = origin;
    link.crossOrigin = "anonymous";
    link.setAttribute("data-preconnect", origin);
    document.head.appendChild(link);
  } catch {
    //
  }
}

function fixLatvianGroupName(name: string) {
  const normalized = normalizeText(name);

  const map: Record<string, string> = {
    "kebaba rullitis": "Kebabs lavašā",
    "kebaba rullītis": "Kebabs lavašā",
    "kebab rullitis": "Kebabs lavašā",
    "kebab rullītis": "Kebabs lavašā",
    wrap: "Kebabs lavašā",
    "kebab wrap": "Kebabs lavašā",
    "iskender kebab": "Iskender kebabs",
    "mini kebab": "Mini kebabs",
    "mazais kebabs": "Mazais kebabs",
  };

  return map[normalized] || name;
}

function fixLatvianVariantName(name: string) {
  const normalized = normalizeText(name);

  const map: Record<string, string> = {
    "liellopu gala": "Liellopa gaļa",
    "liellopa gala": "Liellopa gaļa",
    "liellopu gaļa": "Liellopa gaļa",
    "vistas gala": "Vistas gaļa",
    sajauc: "Mix gaļa",
    mix: "Mix gaļa",
    mixed: "Mix gaļa",
    "liellopu gala + siers": "Liellopa gaļa + siers",
    "liellopa gala + siers": "Liellopa gaļa + siers",
    "vistas gala + siers": "Vistas gaļa + siers",
    "sajauc + siers": "Mix gaļa + siers",
    "mix + siers": "Mix gaļa + siers",
    "liellopa gala + fri": "Liellopa gaļa + frī",
    "liellopa gala + frī": "Liellopa gaļa + frī",
    "vistas gala + fri": "Vistas gaļa + frī",
    "vistas gala + frī": "Vistas gaļa + frī",
    "mix + fri": "Mix gaļa + frī",
    "mix + frī": "Mix gaļa + frī",
    "liellopa gala + risi": "Liellopa gaļa + rīsi",
    "liellopa gala + rīsi": "Liellopa gaļa + rīsi",
    "vistas gala + risi": "Vistas gaļa + rīsi",
    "vistas gala + rīsi": "Vistas gaļa + rīsi",
    "mix + risi": "Mix gaļa + rīsi",
    "mix + rīsi": "Mix gaļa + rīsi",
  };

  return map[normalized] || name;
}

function fixLatvianDescription(text: string) {
  if (!text) return "";

  const normalized = normalizeText(text);

  const exactMap: Record<string, string> = {
    "liela liellopa gaļas kebaba rullīte": "Liels kebabs lavašā ar liellopa gaļu.",
    "liela liellopa galas kebaba rullite": "Liels kebabs lavašā ar liellopa gaļu.",
    "lielais mix kebab rullītis": "Liels kebabs lavašā ar mix gaļu.",
    "lielais mix kebab rullitis": "Liels kebabs lavašā ar mix gaļu.",
    "lielais vistas kebabs rullītis": "Liels kebabs lavašā ar vistas gaļu.",
    "lielais vistas kebabs rullitis": "Liels kebabs lavašā ar vistas gaļu.",
    "liels vistas kebabs ar sieru": "Liels kebabs lavašā ar vistas gaļu un sieru.",
    "liels liellopa kebabs ar sieru": "Liels kebabs lavašā ar liellopa gaļu un sieru.",
    "liels mix kebabs ar sieru": "Liels kebabs lavašā ar mix gaļu un sieru.",
    "lielais mix kebabs": "Liels kebabs lavašā ar mix gaļu.",
    "lielais vistas kebabs": "Liels kebabs lavašā ar vistas gaļu.",
    "lielais liellopa kebabs": "Liels kebabs lavašā ar liellopa gaļu.",
    "big mix iskender kebabs": "Liels Iskender kebabs ar mix gaļu.",
    "lielais vistas iskender kebabs": "Liels Iskender kebabs ar vistas gaļu.",
    "lielo liellopu galas iskender kebabs": "Liels Iskender kebabs ar liellopa gaļu.",
  };

  if (exactMap[normalized]) return exactMap[normalized];

  let result = text
    .replace(/liellopu gaļa/gi, "liellopa gaļa")
    .replace(/liellopu gala/gi, "liellopa gaļa")
    .replace(/liellopu galas/gi, "liellopa gaļas")
    .replace(/vistas gala/gi, "vistas gaļa")
    .replace(/sajauc/gi, "mix gaļa")
    .replace(/kebaba rullītis/gi, "kebabs lavašā")
    .replace(/kebaba rullitis/gi, "kebabs lavašā")
    .replace(/kebab rullītis/gi, "kebabs lavašā")
    .replace(/kebab rullitis/gi, "kebabs lavašā")
    .replace(/rullītis/gi, "kebabs lavašā")
    .replace(/rullitis/gi, "kebabs lavašā")
    .trim();

  result = result.replace(/\s+/g, " ");

  if (result && !/[.!?]$/.test(result)) {
    result += ".";
  }

  if (result) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }

  return result;
}

function shouldTranslateGroupName(name: string) {
  const value = normalizeText(name);

  const preserveList = ["iskender", "pizza", "falafel"];

  return !preserveList.some((word) => value.includes(word));
}

function translatePreservedFoodName(name: string, lang: string) {
  const value = normalizeText(name);

  if (value === "iskender kebab" || value === "iskender kebabs") {
    if (lang === "ru") return "Искендер кебаб";
    if (lang === "uk") return "Іскендер кебаб";
    if (lang === "en") return "Iskender kebab";
    return "Iskender kebabs";
  }

  return name;
}

const MenuImage = memo(function MenuImage({
  src,
  alt,
  eager = false,
  placeholderAlt,
}: {
  src: string;
  alt: string;
  eager?: boolean;
  placeholderAlt: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(eager);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
    setShouldLoad(eager);

    if (!src) return;

    if (eager) {
      addPreconnect(src);
      return;
    }

    const el = wrapperRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          addPreconnect(src);
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "450px 0px",
        threshold: 0.01,
      },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [src, eager]);

  if (!src || failed) {
    return (
      <div
        ref={wrapperRef}
        aria-label={placeholderAlt}
        className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-neutral-900 via-black to-neutral-800"
      >
        <Utensils className="h-9 w-9 text-white/30" />
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative aspect-[4/3] overflow-hidden bg-black">
      {!loaded && <div className="absolute inset-0 animate-pulse bg-white/5" />}

      {shouldLoad ? (
        <img
          src={optimizeImageUrl(src)}
          alt={alt}
          width={800}
          height={600}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "low"}
          decoding="async"
          draggable={false}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : null}
    </div>
  );
});

const MenuSection = () => {
  const { lang } = useContext(LanguageContext);
  const safeLang = (lang as keyof typeof translations) || "lv";
  const t = translations[safeLang] || translations.lv;

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCategory, setOpenCategory] = useState("");

  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    addPreconnect(MENU_CSV_URL);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    async function loadMenu() {
      try {
        const res = await fetch(MENU_CSV_URL, {
          cache: "force-cache",
          signal: controller.signal,
        });

        const text = await res.text();

        if (!isMounted) return;

        const lines = text
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        if (lines.length < 2) {
          setMenuItems([]);
          setLoading(false);
          return;
        }

        const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase().trim());

        const data = lines
          .slice(1)
          .map((line) => {
            const values = parseCsvLine(line);
            const row: Record<string, string> = {};

            headers.forEach((header, index) => {
              row[header] = values[index] || "";
            });

            const groupName = (row.groupname || row.name || "").trim();
            const variantName = (row.variantname || "").trim();
            const csvImage = (row.image || "").trim();
            const override = getImageOverride(groupName, variantName);

            return {
              id: (row.id || `${row.category || ""}-${groupName}-${variantName}-${row.price || ""}`).trim(),
              category: normalizeCategory(row.category || ""),
              groupName,
              variantName,
              description: (row.description || "").trim(),
              price: (row.price || "").trim(),
              image: optimizeImageUrl(override || csvImage),
            };
          })
          .filter((item) => item.category && item.groupName && item.category !== "picas");

        if (isMounted) {
          setMenuItems(data);
          setLoading(false);
        }
      } catch (error: any) {
        if (error?.name !== "AbortError") {
          console.error("Failed to load menu:", error);
          if (isMounted) {
            setMenuItems([]);
            setLoading(false);
          }
        }
      }
    }

    loadMenu();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const shouldTranslate = safeLang !== "lv";

  const translatableTexts = useMemo(() => {
    if (!shouldTranslate) return [];

    return menuItems.flatMap((item) => [
      shouldTranslateGroupName(item.groupName) ? item.groupName || "" : "",
      item.variantName || "",
      item.description || "",
    ]);
  }, [menuItems, shouldTranslate]);

  const translatedTexts = useTranslatedTexts(translatableTexts);

  const localizedItems = useMemo(() => {
    return menuItems.map((item, index) => {
      if (!shouldTranslate) {
        return {
          ...item,
          groupName: fixLatvianGroupName(item.groupName),
          variantName: fixLatvianVariantName(item.variantName),
          description: fixLatvianDescription(item.description),
        };
      }

      const translatedGroupName = shouldTranslateGroupName(item.groupName)
        ? translatedTexts[index * 3] || item.groupName
        : translatePreservedFoodName(item.groupName, safeLang);

      return {
        ...item,
        groupName: translatedGroupName,
        variantName: translatedTexts[index * 3 + 1] || item.variantName,
        description: translatedTexts[index * 3 + 2] || item.description,
      };
    });
  }, [menuItems, translatedTexts, shouldTranslate, safeLang]);

  const groupedByCategory = useMemo(() => {
    const result: Record<string, MenuItem[]> = {};

    localizedItems.forEach((item) => {
      if (!result[item.category]) {
        result[item.category] = [];
      }
      result[item.category].push(item);
    });

    Object.keys(result).forEach((category) => {
      result[category].sort((a, b) => {
        const first = a.groupName.localeCompare(b.groupName);
        if (first !== 0) return first;
        return a.variantName.localeCompare(b.variantName);
      });
    });

    return result;
  }, [localizedItems]);

  const sortedCategories = useMemo(() => {
    const ordered = categoryOrder.filter((category) => groupedByCategory[category]?.length);
    const extra = Object.keys(groupedByCategory).filter(
      (category) => !categoryOrder.includes(category as (typeof categoryOrder)[number]),
    );
    return [...ordered, ...extra];
  }, [groupedByCategory]);

  useEffect(() => {
    if (!openCategory) return;

    const el = categoryRefs.current[openCategory];
    if (!el) return;

    const timeout = window.setTimeout(() => {
      const rect = el.getBoundingClientRect();
      const absoluteTop = window.scrollY + rect.top;
      const offset = 110;

      window.scrollTo({
        top: Math.max(absoluteTop - offset, 0),
        behavior: "smooth",
      });
    }, 80);

    return () => window.clearTimeout(timeout);
  }, [openCategory]);

  if (loading) {
    return (
      <section id="menu" className="py-24">
        <div className="container">
          <div className="text-white/70">{t.loading}</div>
        </div>
      </section>
    );
  }

  return (
    <section id="menu" className="py-24">
      <div className="container space-y-6">
        <div className="mb-4">
          <h2 className="text-3xl font-bold text-white md:text-4xl">{t.title}</h2>
        </div>

        {sortedCategories.map((category) => {
          const dishes = groupedByCategory[category] || [];
          const categoryTitle = t.categories[category as keyof typeof t.categories] || capitalizeFirst(category);

          return (
            <div
              key={`${safeLang}-${category}`}
              ref={(el) => {
                categoryRefs.current[category] = el;
              }}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
            >
              <button
                type="button"
                onClick={() => setOpenCategory(openCategory === category ? "" : category)}
                className="flex w-full items-center justify-between p-6 text-left"
              >
                <div>
                  <h3 className="text-2xl font-bold text-white">{categoryTitle}</h3>
                  <p className="mt-1 text-sm text-white/50">
                    {dishes.length} {t.itemCount}
                  </p>
                </div>

                <ChevronDown
                  className={`h-5 w-5 text-white/70 transition-transform duration-300 ${
                    openCategory === category ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openCategory === category && (
                <div className="grid gap-6 p-6 md:grid-cols-2 xl:grid-cols-3">
                  {dishes.map((dish, index) => {
                    const showVariant =
                      dish.variantName &&
                      normalizeText(dish.variantName) !== normalizeText(t.standard) &&
                      normalizeText(dish.variantName) !== normalizeText(dish.groupName);

                    const cardTitle = dish.groupName || dish.variantName || t.standard;
                    const imageAlt = showVariant ? `${dish.groupName} - ${dish.variantName}` : cardTitle;

                    return (
                      <article
                        key={`${safeLang}-${dish.id}-${index}`}
                        className="overflow-hidden rounded-xl border border-white/10 bg-black"
                      >
                        <MenuImage
                          src={dish.image}
                          alt={imageAlt}
                          eager={index < 2}
                          placeholderAlt={t.placeholderAlt}
                        />

                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xl font-semibold text-white">{cardTitle}</h4>

                              {showVariant ? (
                                <p className="mt-1 text-sm font-medium text-yellow-300/90">{dish.variantName}</p>
                              ) : null}
                            </div>

                            <span className="min-w-[96px] shrink-0 whitespace-nowrap rounded-full border border-yellow-400/20 bg-yellow-400/10 px-4 py-1 text-center text-sm font-bold text-yellow-300">
                              {dish.price ? `${dish.price} €` : "—"}
                            </span>
                          </div>

                          {dish.description ? (
                            <p className="mt-3 text-sm leading-relaxed text-white/60">{dish.description}</p>
                          ) : null}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default MenuSection;
