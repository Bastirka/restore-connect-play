import { useCallback, useContext } from "react";
import type { MouseEvent } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { LanguageContext } from "@/App";

const logoUrl =
  "https://i.postimg.cc/tJRzS579/Noforme-jums-bez-nosaukuma-(2).png";

const mobileHeroVideoUrl =
  "https://pub-4082646d93584a25b2be8c8d5ab6ffa3.r2.dev/copy_DF306E86-73B4-4F2F-AB72-00744D6487CE%20(1).mp4";

const translations = {
  lv: {
    logoAlt: "SEDO logo",
    subtitle: "Kebabi un picas Rēzeknē",
    description: "Svaigi kebabi un gardas picas no kvalitatīvām sastāvdaļām.",
    menuBtn: "Skatīt ēdienkarti",
    orderBtn: "Rezervēt galdiņu",
  },
  en: {
    logoAlt: "SEDO logo",
    subtitle: "Kebabs & Pizza in Rezekne",
    description: "Fresh kebabs and delicious pizzas made from quality ingredients.",
    menuBtn: "View menu",
    orderBtn: "Reserve a table",
  },
  ru: {
    logoAlt: "Логотип SEDO",
    subtitle: "Кебабы и Пицца в Резекне",
    description: "Свежие кебабы и вкусная пицца из качественных ингредиентов.",
    menuBtn: "Смотреть меню",
    orderBtn: "Забронировать столик",
  },
  uk: {
    logoAlt: "Логотип SEDO",
    subtitle: "Кебаби та Піца в Резекне",
    description: "Свіжі кебаби та смачна піца з якісних інгредієнтів.",
    menuBtn: "Переглянути меню",
    orderBtn: "Забронювати столик",
  },
} as const;

type Language = keyof typeof translations;

const isValidLanguage = (value: unknown): value is Language => {
  return typeof value === "string" && value in translations;
};

const HeroSection = () => {
  const { lang } = useContext(LanguageContext);

  const safeLang: Language = isValidLanguage(lang) ? lang : "lv";
  const t = translations[safeLang];

  const scrollToSection = useCallback((href: string) => {
    const id = href.replace("#", "");
    const el = document.getElementById(id);

    if (!el) {
      window.location.hash = href;
      return;
    }

    const navOffset = window.innerWidth >= 768 ? 92 : 76;
    const targetY = el.getBoundingClientRect().top + window.scrollY - navOffset;

    requestAnimationFrame(() => {
      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: "smooth",
      });
    });

    window.history.replaceState(null, "", href);
  }, []);

  const handleHeroLinkClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      e.stopPropagation();
      scrollToSection(href);
    },
    [scrollToSection]
  );

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-[#0b0b0b]">
      {/* Desktop background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 hidden bg-gradient-to-b from-[#0b0b0b] via-[#101010] to-[#111111] md:block"
      />

      {/* Mobile video background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 md:hidden"
      >
        <video
          className="pointer-events-none h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          tabIndex={-1}
        >
          <source src={mobileHeroVideoUrl} type="video/mp4" />
        </video>
      </div>

      {/* Dark overlays */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-black/45 md:bg-black/30"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-black/35 via-black/20 to-black/60"
      />

      {/* Content */}
      <div className="relative z-10 flex min-h-[100svh] items-center justify-center px-4 py-20 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-auto mx-auto flex max-w-4xl flex-col items-center text-center"
        >
          <motion.img
            src={logoUrl}
            alt={t.logoAlt}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.9,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            draggable={false}
            width={400}
            height={400}
            className="pointer-events-none mb-8 h-auto w-[220px] select-none object-contain drop-shadow-[0_12px_40px_rgba(0,0,0,0.45)] sm:w-[280px] md:mb-10 md:w-[340px] lg:w-[400px]"
          />

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl"
          >
            {t.subtitle}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-5 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base md:mt-6 md:text-lg"
          >
            {t.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-10 flex w-full max-w-xl flex-col items-center justify-center gap-4 sm:mt-12 sm:flex-row"
          >
            <motion.a
              href="#menu"
              onClick={(e) => handleHeroLinkClick(e, "#menu")}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.985 }}
              className="luxury-btn-hover pointer-events-auto inline-flex min-h-[54px] w-full touch-manipulation items-center justify-center rounded-2xl bg-[#c62828] px-8 py-4 text-base font-semibold text-white shadow-[0_14px_30px_rgba(198,40,40,0.32)] transition-all duration-300 hover:bg-[#b71c1c] sm:w-auto sm:min-w-[210px]"
            >
              {t.menuBtn}
            </motion.a>

            <motion.a
              href="#reservation"
              onClick={(e) => handleHeroLinkClick(e, "#reservation")}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.985 }}
              className="luxury-btn-hover pointer-events-auto inline-flex min-h-[54px] w-full touch-manipulation items-center justify-center rounded-2xl border border-white/75 bg-transparent px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:bg-white/8 sm:w-auto sm:min-w-[250px]"
            >
              {t.orderBtn}
            </motion.a>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        aria-hidden="true"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
        className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-white/30 md:bottom-8"
      >
        <ChevronDown className="h-6 w-6 md:h-7 md:w-7" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
