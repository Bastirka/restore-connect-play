import { useContext } from "react";
import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import { LanguageContext } from "@/App";

const translations = {
  lv: {
    title1: "Pasūti savu ēdienu",
    title2: "jau šodien",
    description: "Zvaniet mums vai apmeklējiet restorānu — garšīgs ēdiens jūs jau gaida!",
    callNow: "Zvanīt tagad",
  },
  en: {
    title1: "Order your food",
    title2: "today",
    description: "Call us or visit the restaurant — delicious food is already waiting for you!",
    callNow: "Call now",
  },
  ru: {
    title1: "Закажите еду",
    title2: "уже сегодня",
    description: "Позвоните нам или посетите ресторан — вкусная еда уже ждёт вас!",
    callNow: "Позвонить",
  },
  uk: {
    title1: "Замовляйте їжу",
    title2: "вже сьогодні",
    description: "Зателефонуйте нам або завітайте до ресторану — смачна їжа вже чекає на вас!",
    callNow: "Зателефонувати",
  },
} as const;

const CTASection = () => {
  const { lang } = useContext(LanguageContext);
  const safeLang = (lang as keyof typeof translations) || "lv";
  const t = translations[safeLang];

  return (
    <section className="py-24 md:py-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-cta px-10 py-16 text-center shadow-glow"
        >
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, hsl(var(--primary-foreground)) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative z-10 mx-auto max-w-3xl">
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              {t.title1}
              <br />
              {t.title2}
            </h2>

            <p className="text-primary-foreground/80 text-lg md:text-xl mb-10 max-w-xl mx-auto">{t.description}</p>

            <a
              href="tel:+37127000057"
              className="inline-flex items-center gap-2 bg-primary-foreground text-primary px-10 py-4 rounded-xl text-lg font-bold hover:bg-primary-foreground/95 hover:-translate-y-0.5 transition-all duration-300 shadow-lg"
            >
              <Phone className="w-5 h-5" />
              {t.callNow}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
