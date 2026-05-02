import { useState, useEffect, useCallback, useContext } from "react";
import type { MouseEvent } from "react";
import { Menu, X, MapPin, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageContext } from "@/App";

const BOLT_FOOD_URL =
  "https://food.bolt.eu/lv-lv/654-rezekne/p/196433-sedo-restorans/";

const translations = {
  lv: {
    nav: [
      { label: "Par mums", href: "#about" },
      { label: "Ēdienkarte", href: "#menu" },
      { label: "Galerija", href: "#gallery" },
      { label: "Atsauksmes", href: "#reviews" },
    ],
    findUs: "Kur mūs atrast",
    order: "Rezervācija",
    boltFood: "Bolt Food",
    menuLabel: "Izvēlne",
  },
  en: {
    nav: [
      { label: "About", href: "#about" },
      { label: "Menu", href: "#menu" },
      { label: "Gallery", href: "#gallery" },
      { label: "Reviews", href: "#reviews" },
    ],
    findUs: "Find us",
    order: "Reservation",
    boltFood: "Bolt Food",
    menuLabel: "Menu",
  },
  ru: {
    nav: [
      { label: "О нас", href: "#about" },
      { label: "Меню", href: "#menu" },
      { label: "Галерея", href: "#gallery" },
      { label: "Отзывы", href: "#reviews" },
    ],
    findUs: "Как нас найти",
    order: "Резервация",
    boltFood: "Bolt Food",
    menuLabel: "Меню",
  },
  uk: {
    nav: [
      { label: "Про нас", href: "#about" },
      { label: "Меню", href: "#menu" },
      { label: "Галерея", href: "#gallery" },
      { label: "Відгуки", href: "#reviews" },
    ],
    findUs: "Як нас знайти",
    order: "Бронювання",
    boltFood: "Bolt Food",
    menuLabel: "Меню",
  },
} as const;

const languages = ["lv", "en", "ru", "uk"] as const;

type Language = keyof typeof translations;

const isValidLanguage = (value: unknown): value is Language => {
  return typeof value === "string" && value in translations;
};

const Navbar = () => {
  const { lang, setLang } = useContext(LanguageContext);

  const safeLang: Language = isValidLanguage(lang) ? lang : "lv";
  const t = translations[safeLang];

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setOpen(false);
      }
    };

    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onEscape);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onEscape);
    };
  }, []);

  const handleNavClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();

      if (href === "#") {
        setOpen(false);

        requestAnimationFrame(() => {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        });

        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search
        );

        return;
      }

      const id = href.replace("#", "");
      const el = document.getElementById(id);

      setOpen(false);

      if (!el) {
        window.location.hash = href;
        return;
      }

      const navOffset = window.innerWidth >= 768 ? 92 : 76;
      const y = el.getBoundingClientRect().top + window.scrollY - navOffset;

      requestAnimationFrame(() => {
        window.scrollTo({
          top: Math.max(0, y),
          behavior: "smooth",
        });
      });

      window.history.replaceState(null, "", href);
    },
    []
  );

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-[99999] pointer-events-auto transition-all duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        scrolled || open
          ? "border-b border-border/50 bg-background/95 shadow-lg shadow-background/20 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="container relative z-[100001] flex h-16 items-center justify-between md:h-20">
        <a
          href="#"
          onClick={(e) => handleNavClick(e, "#")}
          className="font-display text-2xl font-bold tracking-wider text-primary transition-colors hover:text-primary/90"
        >
          SEDO
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {t.nav.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => handleNavClick(e, l.href)}
              className="nav-link-underline rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-all duration-200 hover:bg-secondary/50 hover:text-foreground"
            >
              {l.label}
            </a>
          ))}

          <div className="ml-3 flex items-center gap-1 rounded-xl border border-border/50 bg-card/70 p-1 backdrop-blur-md">
            {languages.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setLang(item)}
                className={`touch-manipulation rounded-lg px-2.5 py-1.5 text-xs font-bold uppercase transition-all ${
                  safeLang === item
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground/70 hover:bg-secondary/60 hover:text-foreground"
                }`}
                aria-label={item.toUpperCase()}
              >
                {item}
              </button>
            ))}
          </div>

          <a
            href="#location"
            onClick={(e) => handleNavClick(e, "#location")}
            className="ml-3 hidden items-center gap-2 rounded-xl border border-border/50 bg-card/70 px-4 py-2.5 text-sm font-semibold text-foreground transition-all hover:border-primary/50 hover:text-primary lg:inline-flex"
          >
            <MapPin className="h-4 w-4" />
            {t.findUs}
          </a>

          <a
            href="#reservation"
            onClick={(e) => handleNavClick(e, "#reservation")}
            className="ml-2 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-glow"
          >
            <ShoppingBag className="h-4 w-4" />
            {t.order}
          </a>

          <a
            href={BOLT_FOOD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-300 transition-all hover:border-emerald-400/60 hover:bg-emerald-500/15"
          >
            {t.boltFood}
          </a>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
          className="relative z-[100002] touch-manipulation rounded-lg p-2 text-foreground transition-colors hover:bg-secondary/50 md:hidden"
          aria-label={t.menuLabel}
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed inset-x-0 top-16 z-[100000] max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-border/50 bg-background/95 shadow-2xl backdrop-blur-xl md:hidden"
          >
            <div className="container flex flex-col gap-1 py-6">
              <div className="mb-4 flex items-center justify-center gap-2">
                {languages.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setLang(item)}
                    className={`touch-manipulation rounded-xl px-3 py-2 text-sm font-bold uppercase transition-all ${
                      safeLang === item
                        ? "bg-primary text-primary-foreground"
                        : "border border-border/50 bg-card text-foreground/70 hover:text-foreground"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {t.nav.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => handleNavClick(e, l.href)}
                  className="touch-manipulation rounded-xl px-4 py-3 text-lg text-foreground/80 transition-all hover:bg-secondary/50 hover:text-foreground"
                >
                  {l.label}
                </a>
              ))}

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <a
                  href="#location"
                  onClick={(e) => handleNavClick(e, "#location")}
                  className="touch-manipulation flex items-center justify-center gap-2 rounded-xl border border-border/50 bg-card px-5 py-3.5 font-semibold text-foreground"
                >
                  <MapPin className="h-4 w-4" />
                  {t.findUs}
                </a>

                <a
                  href="#reservation"
                  onClick={(e) => handleNavClick(e, "#reservation")}
                  className="touch-manipulation flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-semibold text-primary-foreground"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {t.order}
                </a>

                <a
                  href={BOLT_FOOD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="touch-manipulation flex items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-3.5 font-semibold text-emerald-300"
                >
                  {t.boltFood}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
