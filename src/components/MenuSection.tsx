import React, { memo, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Utensils } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { LanguageContext } from "@/App";

const MENU_API_URL = "https://sedo-menu-proxy.raivisbabris99.workers.dev";
const R2_BASE_URL = "https://pub-ce27dafe278d4f219c7c1ca812bee1fb.r2.dev";

const translations = {
  lv: {
    title: "Ēdienkarte",
    loading: "Ielādējam ēdienkarti...",
    empty: "Ēdienkarte pašlaik nav pieejama.",
    error: "Neizdevās ielādēt ēdienkarti.",
    itemCount: "ēdieni",
    standard: "Standarta",
    comingSoon: "Drīzumā",
    sizes: {
      small: "Mazais",
      big: "Lielais",
      standard: "Standarta",
    },
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
    sizes: {
      small: "Small",
      big: "Big",
      standard: "Standard",
    },
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
    sizes: {
      small: "Маленький",
      big: "Большой",
      standard: "Стандарт",
    },
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
    error: "Не вдалося завантажити menu.",
    itemCount: "страви",
    standard: "Стандарт",
    comingSoon: "Скоро",
    sizes: {
      small: "Малий",
      big: "Великий",
      standard: "Стандарт",
    },
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

type MenuCardGroup = {
  key: string;
  id: string;
  category: string;
  categoryLabel?: string;
  groupName: string;
  description: string;
  image: string;
  sortOrder: number;
  standardItem?: MenuItem;
  smallItem?: MenuItem;
  bigItem?: MenuItem;
  otherItems: MenuItem[];
  variants?: Array<{
    variantName: string;
    price: string;
    image?: string;
    description?: string;
  }>;
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
  if (!value) return "/placeholder.svg";

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  const cleaned = value.replace(/^\/+/, "");
  return `${R2_BASE_URL}/${cleaned}`;
}

function detectVariantKind(item: MenuItem, category: string) {
  const v = normalizeText(item.variantName);
  const g = normalizeText(item.groupName);
  const c = normalizeText(category);

  // Standard size detection
  if (v === "mazais" || v === "small" || v === "маленький" || v === "малий") {
    return "small";
  }
  if (v === "lielais" || v === "big" || v === "large" || v === "большой" || v === "великий") {
    return "big";
  }
  if (v === "standarta" || v === "standard" || v === "стандарт") {
    return "standard";
  }

  // Dessert specific grouping
  if (c === "deserti" || c === "deserti" || c === "десерты" || c === "десерти") {
    if (g === "baklava" && (v === "" || v === "baklava")) {
      return "standard"; // Bez saldējuma
    }
    if (g === "baklava" && (v.includes("ar") || v.includes("saldējumu") || v.includes("с") || v.includes("морожен"))) {
      return "big"; // Ar saldējumu
    }
    if (g === "saldējums" && (v === "vaniļa" || v === "vanilla" || v === "ваниль")) {
      return "small"; // Vaniļa
    }
    if (g === "saldējums" && (v === "šokolāde" || v === "šokolāde" || v === "шоколад")) {
      return "big"; // Šokolāde
    }
  }

  return "other";
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

function MenuCard({
  group,
  t,
  eagerImage,
}: {
  group: MenuCardGroup;
  t: (typeof translations)[LangKey];
  eagerImage: boolean;
}) {
  const variants = group.variants || [];
  const [selectedVariant, setSelectedVariant] = useState(0);

  useEffect(() => {
    setSelectedVariant(0);
  }, [group.key]);

  const activeVariant = variants[selectedVariant];
  const priceText = activeVariant ? `${activeVariant.price} €` : "—";
  const imageAlt = [group.groupName, activeVariant?.description || group.description, activeVariant?.variantName].filter(Boolean).join(" • ");
  const activeImage = activeVariant?.image || group.image;
  const activeDesc = activeVariant?.description || group.description;

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

{variants.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {variants.map((variant, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedVariant(index)}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition-all ${
                  selectedVariant === index
                    ? "border-yellow-300 bg-yellow-300 text-black shadow-md"
                    : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/30"
                }`}
              >
                {variant.variantName} — {variant.price} €
              </button>
            ))}
          </div>
        )}
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
    addPreconnect(R2_BASE_URL);
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
          headers: {
            Accept: "application/json",
          },
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
          .map((item: any, index: number) => ({
            id: String(item.id || `${index + 1}`).trim(),
            category: String(item.category || "").trim(),
            categoryLabel: String(item.categoryLabel || "").trim(),
            groupName: String(item.groupName || "").trim(),
            variantName: String(item.variantName || "").trim(),
            description: String(item.description || "").trim(),
            price: String(item.price || "").trim(),
            image: resolveMenuImageUrl(String(item.image || item.images || "").trim()),
            sortOrder: Number(item.sortOrder || index + 1),
            sizeKey: String(item.sizeKey || "").trim(),
          }))
          .filter((item) => {
            const category = String(item.category || "").trim();
            const groupName = String(item.groupName || "").trim();
            const variantName = String(item.variantName || "").trim();
            const description = String(item.description || "").trim();

            if (!category || !groupName) return false;

            const categoryNormalized = normalizeText(category);
            const groupNameNormalized = normalizeText(groupName);
            const variantNormalized = normalizeText(variantName);
            const descriptionNormalized = normalizeText(description);

            const looksLikeHeaderRow =
              categoryNormalized === "category" ||
              groupNameNormalized === "groupname" ||
              groupNameNormalized === "groupname_ru" ||
              groupNameNormalized === "groupname_en" ||
              groupNameNormalized === "groupname_lv" ||
              groupNameNormalized === "groupname_uk" ||
              variantNormalized === "variantname" ||
              variantNormalized === "variant_ru" ||
              variantNormalized === "variant_en" ||
              variantNormalized === "variant_lv" ||
              variantNormalized === "variant_uk" ||
              descriptionNormalized === "description" ||
              descriptionNormalized === "desc_ru" ||
              descriptionNormalized === "desc_en" ||
              descriptionNormalized === "desc_lv" ||
              descriptionNormalized === "desc_uk";

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
      const byCardKey: Record<string, MenuCardGroup> = {};
      
// Process ALL items except desserts (kebabs, burgers, etc work with generic logic)
      const dessertCategory = 'deserti';
      const nonDessertItems = menuItems.filter(item => normalizeText(item.category) !== dessertCategory);
      
      nonDessertItems.forEach((item, index) => {
        const cardKey = [item.category, normalizeText(item.groupName), normalizeText(item.description)].join("::");
        
        if (!byCardKey[cardKey]) {
          byCardKey[cardKey] = {
            key: cardKey,
            id: item.id || String(index + 1),
            category: item.category,
            categoryLabel: item.categoryLabel,
            groupName: item.groupName,
            description: item.description,
            image: item.image,
            sortOrder: item.sortOrder || index + 1,
            standardItem: undefined,
            smallItem: undefined,
            bigItem: undefined,
            otherItems: [],
            variants: [],
          };
        }
        
        const group = byCardKey[cardKey];
        if (!group.image && item.image) group.image = item.image;
        if (!group.categoryLabel && item.categoryLabel) group.categoryLabel = item.categoryLabel;
        if (item.sortOrder < group.sortOrder) group.sortOrder = item.sortOrder;
        
        const kind = item.sizeKey || detectVariantKind(item, item.category);
        if (kind === "small" && !group.smallItem) group.smallItem = item;
        else if (kind === "big" && !group.bigItem) group.bigItem = item;
        else if (kind === "standard" && !group.standardItem) group.standardItem = item;
        else group.otherItems.push(item);
      });

      // SPECIAL dessert grouping - EXACTLY 2 cards with 2 variants each
      const dessertItems = menuItems.filter(item => normalizeText(item.category) === dessertCategory);
      
      // Card 1: Baklava - ALWAYS create if desserts exist
      const baklavaItems = dessertItems.filter(item => normalizeText(item.groupName + item.variantName + item.description + item.category).includes('baklava') || normalizeText(item.groupName).includes('baklav'));
      if (baklavaItems.length > 0 || dessertItems.length > 0) {
        const itemsSorted = baklavaItems.length > 0 ? baklavaItems.sort((a,b) => Number(a.sortOrder) - Number(b.sortOrder)) : dessertItems.slice(0,2).sort((a,b) => Number(a.sortOrder) - Number(b.sortOrder));
        const classic = itemsSorted.find(item => !normalizeText(item.variantName || '').includes('ar') && !normalizeText(item.variantName || '').includes('sald')) || itemsSorted[0] || dessertItems[0];
        const withIce = itemsSorted.find(item => normalizeText(item.variantName || '').includes('ar') || normalizeText(item.variantName || '').includes('sald')) || itemsSorted[1] || dessertItems[1];
        
        byCardKey['deserti::baklava'] = {
          key: 'deserti::baklava',
          id: 'baklava',
          category: dessertCategory,
          categoryLabel: '',
          groupName: classic?.groupName || 'Baklava',
          description: classic?.description || 'Turku baklava',
          image: classic?.image || baklavaItems[0]?.image || dessertItems[0]?.image || '/placeholder.svg',
          sortOrder: 1,
          variants: [
            {variantName: classic?.variantName || classic?.groupName || 'Classic', price: classic?.price || '5.50', image: classic?.image || '/placeholder.svg', description: classic?.description || ''},
            {variantName: withIce?.variantName || withIce?.groupName || 'With ice cream', price: withIce?.price || '7.00', image: withIce?.image || '/placeholder.svg', description: withIce?.description || ''},
          ].filter(v => v.price),
          standardItem: undefined,
          smallItem: undefined,
          bigItem: undefined,
          otherItems: [],
        };
      }
      
      // Card 2: Saldējums - ALWAYS create if desserts exist
      const icecreamItems = dessertItems.filter(item => normalizeText(item.groupName + item.variantName + item.description + item.category).match(/saldēj|moroz|moroziv|van|šokol|shokol/i));
      if (icecreamItems.length > 0 || dessertItems.length > 0) {
        const remainingDesserts = dessertItems.filter(item => !baklavaItems.includes(item));
        const itemsSorted = icecreamItems.length > 0 ? icecreamItems.sort((a,b) => Number(a.sortOrder) - Number(b.sortOrder)) : remainingDesserts.slice(0,2).sort((a,b) => Number(a.sortOrder) - Number(b.sortOrder));
        const vanilla = itemsSorted.find(item => normalizeText(item.variantName || item.groupName || '').includes('van')) || itemsSorted[0] || remainingDesserts[0];
        const chocolate = itemsSorted.find(item => normalizeText(item.variantName || item.groupName || '').includes('šokol')) || itemsSorted[1] || remainingDesserts[1];
        
        byCardKey['deserti::saldējums'] = {
          key: 'deserti::saldējums',
          id: 'saldējums',
          category: dessertCategory,
          categoryLabel: '',
          groupName: vanilla?.groupName || 'Ice cream',
          description: vanilla?.description || 'Ice cream portion',
          image: vanilla?.image || icecreamItems[0]?.image || '/placeholder.svg',
          sortOrder: 2,
          variants: [
            {variantName: vanilla?.variantName || vanilla?.groupName || 'Vanilla', price: vanilla?.price || '4.50', image: vanilla?.image || '/placeholder.svg', description: vanilla?.description || ''},
            {variantName: chocolate?.variantName || chocolate?.groupName || 'Chocolate', price: chocolate?.price || '4.50', image: chocolate?.image || '/placeholder.svg', description: chocolate?.description || ''},
          ].filter(v => v.price),
          standardItem: undefined,
          smallItem: undefined,
          bigItem: undefined,
          otherItems: [],
        };
      }

      // Build variants for non-dessert groups only (desserts have explicit variants)
      Object.values(byCardKey).forEach((group) => {
        if (group.category === dessertCategory) return; // Skip desserts - explicit variants
        
        const allVariants = [];
        if (group.smallItem) allVariants.push({variantName: group.smallItem?.variantName || t.sizes.small, price: group.smallItem.price!, image: group.smallItem.image, description: group.smallItem.description || ''});
        if (group.standardItem) allVariants.push({variantName: group.standardItem?.variantName || group.groupName, price: group.standardItem.price!, image: group.standardItem.image, description: group.standardItem.description || ''});
        if (group.bigItem) allVariants.push({variantName: group.bigItem?.variantName || t.sizes.big, price: group.bigItem.price!, image: group.bigItem.image, description: group.bigItem.description || ''});
        group.otherItems.forEach((item: MenuItem) => {
          if (item) allVariants.push({variantName: item.variantName || group.groupName, price: item.price, image: item.image, description: item.description || ''});
        });
        group.variants = allVariants.filter((v: any) => v.price);
      });
      
      // Populate categories from byCardKey
      Object.values(byCardKey).forEach((group) => {
        if (!categories[group.category]) categories[group.category] = [];
        categories[group.category].push(group);
      });
      
      // Sort categories
      Object.keys(categories).forEach((cat) => {
        categories[cat].sort((a, b) => a.sortOrder - b.sortOrder);
      });
      
      return categories;
    }, [menuItems]);


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

              {openCategory === category && (
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
                        <MenuCard key={`${safeLang}-${group.key}`} group={group} t={t} eagerImage={index < 2} />
                      ))}
                    </div>
                  )}
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
