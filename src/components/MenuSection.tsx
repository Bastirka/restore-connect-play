import React, { memo, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Utensils } from "lucide-react";
import { LanguageContext } from "@/App";

const MENU_API_URL =
  "https://script.google.com/macros/s/AKfycby2xrL8XYepyO4mHXeuxUiK3o9jpib133C-vUlMJosmZhTs5P-rO_O5a1AsUnFgUW2w8Q/exec";

const R2_BASE_URL = "https://pub-ce27dafe278d4f219c7c1ca812bee1fb.r2.dev";

const translations = {
  lv: {
    title: "Ēdienkarte",
    loading: "Ielādējam ēdienkarti...",
    itemCount: "ēdieni",
    standard: "Standarta",
    categories: {
      kebabi: "Kebabi",
      burgeri: "Burgeri",
      picas: "Picas",
      pide: "Pide",
      salads: "Salāti",
      vegetarian: "Veģetārie ēdieni",
      kids: "Bērnu ēdienkarte",
      dzerieni: "Dzērieni",
      deserti: "Deserti",
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
      picas: "Pizzas",
      pide: "Pide",
      salads: "Salads",
      vegetarian: "Vegetarian dishes",
      kids: "Kids menu",
      dzerieni: "Drinks",
      deserti: "Desserts",
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
      picas: "Пиццы",
      pide: "Пиде",
      salads: "Салаты",
      vegetarian: "Вегетарианские блюда",
      kids: "Детское меню",
      dzerieni: "Напитки",
      deserti: "Десерты",
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
      picas: "Піци",
      pide: "Піде",
      salads: "Салати",
      vegetarian: "Вегетаріанські страви",
      kids: "Дитяче меню",
      dzerieni: "Напої",
      deserti: "Десерти",
    },
    placeholderAlt: "Зображення страви",
  },
} as const;

type LangKey = keyof typeof translations;

type MenuItem = {
  id: string;
  category: string;
  categoryLabel: string;
  groupName: string;
  variantName: string;
  description: string;
  price: string;
  image: string;
};

const categoryOrder = [
  "kebabi",
  "burgeri",
  "picas",
  "pide",
  "salads",
  "vegetarian",
  "kids",
  "dzerieni",
  "deserti",
] as const;

const categoryAliases: Record<string, (typeof categoryOrder)[number]> = {
  kebab: "kebabi",
  kebabs: "kebabi",
  kebabi: "kebabi",
  "кебабы": "kebabi",
  "кебаби": "kebabi",
  burger: "burgeri",
  burgers: "burgeri",
  burgeri: "burgeri",
  "бургеры": "burgeri",
  "бургери": "burgeri",
  pizza: "picas",
  pizzas: "picas",
  picas: "picas",
  "пиццы": "picas",
  "піци": "picas",
  pide: "pide",
  "пиде": "pide",
  "піде": "pide",
  salad: "salads",
  salads: "salads",
  salati: "salads",
  "салаты": "salads",
  "салати": "salads",
  vegetarian: "vegetarian",
  "vegetarian dishes": "vegetarian",
  "vegetarianie edieni": "vegetarian",
  "vegetarie edieni": "vegetarian",
  "вегетарианские блюда": "vegetarian",
  "вегетаріанські страви": "vegetarian",
  kids: "kids",
  "kids menu": "kids",
  "bernu edienkarte": "kids",
  "детское меню": "kids",
  "дитяче меню": "kids",
  dzerieni: "dzerieni",
  drink: "dzerieni",
  drinks: "dzerieni",
  "напитки": "dzerieni",
  "напої": "dzerieni",
  dessert: "deserti",
  desserts: "deserti",
  deserti: "deserti",
  "десерты": "deserti",
  "десерти": "deserti",
};

function normalizeText(value: string) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function capitalizeFirst(text: string) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function normalizeCategory(value: string) {
  const normalized = normalizeText(value).replace(/\s+/g, " ");

  if (!normalized) return "";

  return categoryAliases[normalized] || normalized;
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

function resolveMenuImageUrl(imageValue: string) {
  const value = String(imageValue || "").trim();
  if (!value) return "";

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  const encodedPath = value
    .replace(/^\/+/, "")
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `${R2_BASE_URL}/${encodedPath}`;
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
          src={src}
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

  const safeLang: LangKey = lang === "lv" || lang === "en" || lang === "ru" || lang === "uk" ? lang : "lv";

  const t = translations[safeLang];

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCategory, setOpenCategory] = useState("");

  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    addPreconnect(MENU_API_URL);
    addPreconnect(R2_BASE_URL);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    async function loadMenu() {
      try {
        setLoading(true);

        const url = `${MENU_API_URL}?action=getMenu&lang=${encodeURIComponent(safeLang)}`;
        console.log("[Menu] request URL:", url);

        const res = await fetch(url, {
          signal: controller.signal,
        });

        const rawText = await res.text();

        if (!res.ok) {
          console.error("[Menu] request failed:", {
            status: res.status,
            statusText: res.statusText,
            body: rawText,
          });
          throw new Error(`Failed to load menu: ${res.status} ${res.statusText}`.trim());
        }

        let data: unknown;

        try {
          data = rawText ? JSON.parse(rawText) : [];
        } catch (parseError) {
          console.error("[Menu] invalid JSON response:", rawText);
          throw parseError;
        }

        console.log("[Menu] raw API response:", data);

        if (!Array.isArray(data)) {
          console.error("[Menu] expected array response but received:", data);

          if (isMounted) {
            setMenuItems([]);
            setLoading(false);
          }

          throw new Error("Menu API response is not array");
        }

        const normalized: MenuItem[] = data
          .map((item: any, index: number) => {
            const category = normalizeCategory(String(item?.category || item?.categoryKey || "").trim());
            const groupName = String(item?.groupName || item?.name || item?.title || "").trim();
            const isActiveRaw = item?.active;
            const isActive =
              isActiveRaw === undefined || isActiveRaw === null || isActiveRaw === ""
                ? true
                : isActiveRaw === true ||
                  String(isActiveRaw).trim().toLowerCase() === "true" ||
                  String(isActiveRaw).trim() === "1";

            if (!category || !groupName || !isActive) {
              return null;
            }

            return {
              id: String(
                item?.id ||
                  `${category}-${groupName}-${item?.variantName || item?.variant || ""}-${item?.price || ""}-${index}`,
              ).trim(),
              category,
              categoryLabel: String(item?.categoryLabel || "").trim(),
              groupName,
              variantName: String(item?.variantName || item?.variant || "").trim(),
              description: String(item?.description || "").trim(),
              price: String(item?.price || "").trim(),
              image: resolveMenuImageUrl(String(item?.image || item?.images || item?.imageUrl || "").trim()),
            };
          })
          .filter((item): item is MenuItem => item !== null);

        console.log("[Menu] normalized menu items:", normalized);

        if (isMounted) {
          setMenuItems(normalized);
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
  }, [safeLang]);

  const groupedByCategory = useMemo(() => {
    const result: Record<string, MenuItem[]> = {};

    menuItems.forEach((item) => {
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
  }, [menuItems]);

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
          const categoryTitle =
            dishes[0]?.categoryLabel ||
            t.categories[category as keyof typeof t.categories] ||
            capitalizeFirst(category);

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
