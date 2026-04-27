import React, { memo, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Utensils } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { LanguageContext } from "@/App";

const MENU_API_URL = "https://sedo-menu-proxy.raivisbabris99.workers.dev";

const translations = {
  lv: {
    title: "Ēdienkarte",
    loading: "Ielādējam ēdienkarti...",
    empty: "Ēdienkarte pašlaik nav pieejama.",
    error: "Neizdevās ielādēt ēdienkarti.",
    itemCount: "ēdieni",
    standard: "Standarta",
    comingSoon: "Drīzumā",
    sizes: { small: "Mazais", big: "Lielais", standard: "Standarta" },
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
    empty: "Menu is currently unavailable.",
    error: "Failed to load menu.",
    itemCount: "dishes",
    standard: "Standard",
    comingSoon: "Coming soon",
    sizes: { small: "Small", big: "Big", standard: "Standard" },
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
    empty: "Меню сейчас недоступно.",
    error: "Не удалось загрузить меню.",
    itemCount: "блюда",
    standard: "Стандарт",
    comingSoon: "Скоро",
    sizes: { small: "Маленький", big: "Большой", standard: "Стандарт" },
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
    empty: "Меню зараз недоступне.",
    error: "Не вдалося завантажити меню.",
    itemCount: "страви",
    standard: "Стандарт",
    comingSoon: "Скоро",
    sizes: { small: "Малий", big: "Великий", standard: "Стандарт" },
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
  categoryLabel?: string;
  groupName: string;
  variantName: string;
  description: string;
  price: string;
  image: string;
  sortOrder: number;
  sizeKey?: string;
};

type MenuVariant = {
  variantName: string;
  price: string;
  image: string;
  description: string;
  sortOrder: number;
};

type MenuCardGroup = {
  key: string;
  id: string;
  category: string;
  categoryLabel?: string;
  groupName: string;
  description: string;
  image: string;
  sortOrder: number;
  variants: MenuVariant[];
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

const comingSoonCategories = ["picas"];

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

function resolveMenuImageUrl(imageValue: string) {
  const value = String(imageValue || "").trim();

  if (!value) return "/placeholder.svg";

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return value;
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

function detectVariantKind(item: MenuItem) {
  const sizeKey = normalizeText(item.sizeKey || "");
  const variantName = normalizeText(item.variantName || "");
  const value = sizeKey || variantName;

  if (value === "mazais" || value === "small" || value === "маленький" || value === "малий") {
    return "small";
  }

  if (
    value === "lielais" ||
    value === "big" ||
    value === "large" ||
    value === "большой" ||
    value === "великий"
  ) {
    return "big";
  }

  if (value === "standarta" || value === "standard" || value === "стандарт") {
    return "standard";
  }

  return "other";
}

function makeGroupKey(item: MenuItem) {
  const category = normalizeText(item.category);
  const groupName = normalizeText(item.groupName);

  if (category === "deserti") {
    return `${category}::${groupName}`;
  }

  const kind = detectVariantKind(item);

  if (kind === "small" || kind === "big" || kind === "standard") {
    return `${category}::${groupName}::${normalizeText(item.description)}`;
  }

  return `${category}::${groupName}::${normalizeText(item.description)}`;
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
        if (entries[0]?.isIntersecting) {
          addPreconnect(src);
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "450px 0px", threshold: 0.01 },
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

function MenuCard({
  group,
  t,
  eagerImage,
}: {
  group: MenuCardGroup;
  t: (typeof translations)[LangKey];
  eagerImage: boolean;
}) {
  const [selectedVariant, setSelectedVariant] = useState(0);

  useEffect(() => {
    setSelectedVariant(0);
  }, [group.key]);

  const variants = group.variants || [];
  const activeVariant = variants[selectedVariant] || variants[0];

  const activeImage = activeVariant?.image || group.image || "/placeholder.svg";
  const activeDesc = activeVariant?.description || group.description || "";
  const priceText = activeVariant?.price ? `${activeVariant.price} €` : "—";

  const imageAlt = [group.groupName, activeDesc, activeVariant?.variantName].filter(Boolean).join(" • ");

  return (
    <article className="luxury-card-hover overflow-hidden rounded-xl border border-white/10 bg-black">
      <MenuImage src={activeImage} alt={imageAlt} eager={eagerImage} placeholderAlt={t.placeholderAlt} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h4 className="text-xl font-semibold text-white">{group.groupName}</h4>

            {activeDesc ? (
              <p className="mt-1 text-sm font-medium text-yellow-300/90">{activeDesc}</p>
            ) : null}
          </div>

          <span className="min-w-[96px] shrink-0 whitespace-nowrap rounded-full border border-yellow-400/20 bg-yellow-400/10 px-4 py-1 text-center text-sm font-bold text-yellow-300">
            {priceText}
          </span>
        </div>

        {variants.length > 1 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {variants.map((variant, index) => (
              <button
                key={`${variant.variantName}-${variant.price}-${index}`}
                type="button"
                onClick={() => setSelectedVariant(index)}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition-all ${
                  selectedVariant === index
                    ? "border-yellow-300 bg-yellow-300 text-black shadow-md"
                    : "border-white/15 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/10"
                }`}
              >
                {variant.variantName} — {variant.price} €
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

const MenuSection = () => {
  const { lang } = useContext(LanguageContext);
  const safeLang: LangKey = lang === "lv" || lang === "en" || lang === "ru" || lang === "uk" ? lang : "lv";
  const t = translations[safeLang];

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [openCategory, setOpenCategory] = useState("");
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    addPreconnect(MENU_API_URL);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadMenu() {
      try {
        setLoading(true);
        setErrorMessage("");

        const url = `${MENU_API_URL}?action=getMenu&lang=${encodeURIComponent(safeLang)}`;

        const res = await fetch(url, {
          method: "GET",
          redirect: "follow",
          headers: { Accept: "application/json" },
        });

        const text = await res.text();

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${text}`);
        }

        let data: any;

        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(`Invalid JSON response: ${text.slice(0, 300)}`);
        }

        if (!Array.isArray(data)) {
          throw new Error(`Menu API response is not array: ${JSON.stringify(data).slice(0, 300)}`);
        }

        const normalized: MenuItem[] = data
          .map((item: any, index: number) => {
            const rawImage = String(item.image || item.images || "").trim();

            return {
              id: String(item.id || `${index + 1}`).trim(),
              category: String(item.category || "").trim(),
              categoryLabel: String(item.categoryLabel || "").trim(),
              groupName: String(item.groupName || "").trim(),
              variantName: String(item.variantName || "").trim(),
              description: String(item.description || "").trim(),
              price: String(item.price || "").trim(),
              image: resolveMenuImageUrl(rawImage),
              sortOrder: Number(item.sortOrder || index + 1),
              sizeKey: String(item.sizeKey || "").trim(),
            };
          })
          .filter((item) => {
            const category = normalizeText(item.category);
            const groupName = normalizeText(item.groupName);
            const variant = normalizeText(item.variantName);
            const description = normalizeText(item.description);
            const price = normalizeText(item.price);

            if (!category || !groupName) return false;

            const looksLikeHeaderRow =
              category === "category" ||
              groupName === "groupname" ||
              groupName === "groupname_ru" ||
              groupName === "groupname_en" ||
              groupName === "groupname_lv" ||
              groupName === "groupname_uk" ||
              variant === "variantname" ||
              variant === "variant_ru" ||
              variant === "variant_en" ||
              variant === "variant_lv" ||
              variant === "variant_uk" ||
              description === "description" ||
              description === "desc_ru" ||
              description === "desc_en" ||
              description === "desc_lv" ||
              description === "desc_uk" ||
              price === "price";

            return !looksLikeHeaderRow;
          });

        if (isMounted) {
          setMenuItems(normalized);
          setLoading(false);
        }
      } catch (error: any) {
        console.error("Failed to load menu:", error);

        if (isMounted) {
          setMenuItems([]);
          setErrorMessage(error?.message || "Unknown error");
          setLoading(false);
        }
      }
    }

    loadMenu();

    return () => {
      isMounted = false;
    };
  }, [safeLang]);

  const groupedByCategory = useMemo(() => {
    const categories: Record<string, MenuCardGroup[]> = {};
    const groups: Record<string, MenuCardGroup> = {};

    menuItems.forEach((item, index) => {
      const category = normalizeText(item.category);
      const key = makeGroupKey(item);

      if (!groups[key]) {
        groups[key] = {
          key,
          id: item.id || String(index + 1),
          category,
          categoryLabel: item.categoryLabel,
          groupName: item.groupName,
          description: item.description,
          image: item.image || "/placeholder.svg",
          sortOrder: item.sortOrder || index + 1,
          variants: [],
        };
      }

      const group = groups[key];

      if (!group.categoryLabel && item.categoryLabel) {
        group.categoryLabel = item.categoryLabel;
      }

      if (item.sortOrder < group.sortOrder) {
        group.sortOrder = item.sortOrder;
      }

      if ((!group.image || group.image === "/placeholder.svg") && item.image && item.image !== "/placeholder.svg") {
        group.image = item.image;
      }

      group.variants.push({
        variantName: item.variantName || t.standard,
        price: item.price,
        image: item.image || "/placeholder.svg",
        description: item.description || "",
        sortOrder: item.sortOrder || index + 1,
      });
    });

    Object.values(groups).forEach((group) => {
      group.variants = group.variants
        .filter((variant) => variant.price)
        .sort((a, b) => {
          const aKind = normalizeText(a.variantName);
          const bKind = normalizeText(b.variantName);

          const order = (value: string) => {
            if (value === "mazais" || value === "small" || value === "маленький" || value === "малий") return 1;
            if (value === "standarta" || value === "standard" || value === "стандарт") return 2;
            if (value === "lielais" || value === "big" || value === "large" || value === "большой" || value === "великий") return 3;
            return 10;
          };

          const orderDiff = order(aKind) - order(bKind);

          if (orderDiff !== 0) return orderDiff;

          return a.sortOrder - b.sortOrder;
        });

      const firstVariantWithImage = group.variants.find(
        (variant) => variant.image && variant.image !== "/placeholder.svg",
      );

      if (firstVariantWithImage?.image) {
        group.image = firstVariantWithImage.image;
      }

      if (group.variants[0]?.description) {
        group.description = group.variants[0].description;
      }

      if (!categories[group.category]) {
        categories[group.category] = [];
      }

      categories[group.category].push(group);
    });

    Object.keys(categories).forEach((category) => {
      categories[category].sort((a, b) => a.sortOrder - b.sortOrder);
    });

    return categories;
  }, [menuItems, t.standard]);

  const sortedCategories = useMemo(() => {
    const ordered = categoryOrder.filter(
      (category) => groupedByCategory[category]?.length || comingSoonCategories.includes(category),
    );

    const extra = Object.keys(groupedByCategory).filter((category) => {
      const normalized = normalizeText(category);

      if (normalized === "category") return false;

      return !categoryOrder.includes(category as (typeof categoryOrder)[number]);
    });

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

  if (errorMessage) {
    return (
      <section id="menu" className="py-24">
        <div className="container">
          <h2 className="text-3xl font-bold text-white md:text-4xl">{t.title}</h2>

          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {t.error}
            <br />
            <span className="text-red-300/80">{errorMessage}</span>
          </div>
        </div>
      </section>
    );
  }

  if (!menuItems.length && !comingSoonCategories.length) {
    return (
      <section id="menu" className="py-24">
        <div className="container">
          <h2 className="text-3xl font-bold text-white md:text-4xl">{t.title}</h2>
          <div className="mt-4 text-white/60">{t.empty}</div>
        </div>
      </section>
    );
  }

  return (
    <section id="menu" className="py-24">
      <div className="container space-y-6">
        <ScrollReveal className="mb-4">
          <h2 className="text-3xl font-bold text-white md:text-4xl">{t.title}</h2>
        </ScrollReveal>

        {sortedCategories.map((category) => {
          const dishes = groupedByCategory[category] || [];
          const isComingSoon = comingSoonCategories.includes(category) && dishes.length === 0;

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
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-bold text-white">{categoryTitle}</h3>

                    {isComingSoon ? (
                      <span className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-yellow-300">
                        {t.comingSoon}
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-1 text-sm text-white/50">
                    {isComingSoon ? t.comingSoon : `${dishes.length} ${t.itemCount}`}
                  </p>
                </div>

                <ChevronDown
                  className={`h-5 w-5 text-white/70 transition-transform duration-300 ${
                    openCategory === category ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openCategory === category ? (
                <div className="p-6">
                  {isComingSoon ? (
                    <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-yellow-400/20 bg-gradient-to-br from-yellow-400/10 via-yellow-300/5 to-transparent text-center">
                      <div>
                        <p className="text-lg font-semibold text-yellow-300">{t.comingSoon}</p>
                        <p className="mt-2 text-sm text-white/55">{categoryTitle}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="stagger-children grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {dishes.map((group, index) => (
                        <MenuCard
                          key={`${safeLang}-${group.key}`}
                          group={group}
                          t={t}
                          eagerImage={index < 2}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default MenuSection;
