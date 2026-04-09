import { useContext } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { LanguageContext } from "@/App";

const logoUrl = "https://i.postimg.cc/kGfcBv3j/Chat-GPT-Image-2026-g-19-marts-00-44-58.png";

const translations = {
  lv: {
    logoAlt: "SEDO logo",
    subtitle: "Kebabi Rēzeknē",
    description: "Svaigi kebabi un ātrā ēdināšana no kvalitatīvām sastāvdaļām.",
    menuBtn: "Skatīt ēdienkarti",
    orderBtn: "Rezervēt galdiņu",
  },
  en: {
    logoAlt: "SEDO logo",
    subtitle: "Kebabs in Rezekne",
    description: "Fresh kebabs and fast food made from quality ingredients.",
    menuBtn: "View menu",
    orderBtn: "Reserve a table",
  },
  ru: {
    logoAlt: "Логотип SEDO",
    subtitle: "Кебабы в Резекне",
    description: "Свежие кебабы и быстрое питание из качественных ингредиентов.",
    menuBtn: "Смотреть меню",
    orderBtn: "Забронировать столик",
  },
  uk: {
    logoAlt: "Логотип SEDO",
    subtitle: "Кебаби в Резекне",
    description: "Свіжі кебаби та швидке харчування з якісних інгредієнтів.",
    menuBtn: "Переглянути меню",
    orderBtn: "Забронювати столик",
  },
} as const;

const HeroSection = () => {
  const { lang } = useContext(LanguageContext);
  const t = translations[lang as keyof typeof translations] || translations.lv;

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#0b0b0b]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0b0b] via-[#101010] to-[#111111]" />

      <div className="relative z-10 flex min-h-[100svh] items-center justify-center px-4 py-20 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: "easeOut" }}
          className="mx-auto flex max-w-4xl flex-col items-center text-center"
        >
          <motion.img
            src={logoUrl}
            alt={t.logoAlt}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.08, ease: "easeOut" }}
    loading="eager"
    fetchPriority="high"
    decoding="async"
    width={400}
    height={400}
    className="mb-8 h-auto w-[220px] object-contain sm:w-[280px] md:mb-10 md:w-[340px] lg:w-[400px] drop-shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
          />

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.18 }}
            className="max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl"
          >
            {t.subtitle}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.28 }}
            className="mt-5 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base md:mt-6 md:text-lg"
          >
            {t.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.38 }}
            className="mt-10 flex w-full max-w-xl flex-col items-center justify-center gap-4 sm:mt-12 sm:flex-row"
          >
            <motion.a
              href="#menu"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.985 }}
              className="inline-flex min-h-[54px] w-full items-center justify-center rounded-2xl bg-[#c62828] px-8 py-4 text-base font-semibold text-white shadow-[0_14px_30px_rgba(198,40,40,0.32)] transition-all duration-300 hover:bg-[#b71c1c] sm:w-auto sm:min-w-[210px]"
            >
              {t.menuBtn}
            </motion.a>

            <motion.a
              href="#reservation"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.985 }}
              className="inline-flex min-h-[54px] w-full items-center justify-center rounded-2xl border border-white/75 bg-transparent px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:bg-white/8 sm:w-auto sm:min-w-[250px]"
            >
              {t.orderBtn}
            </motion.a>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
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
