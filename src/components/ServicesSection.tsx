import { useContext } from "react";
import { motion } from "framer-motion";
import { Phone, MessageCircle } from "lucide-react";
import { LanguageContext } from "@/App";

const PHONE_NUMBER = "+37127000057";

const translations = {
  lv: {
    badge: "Pasūtīšana",
    title: "Pasūti savu ēdienu jau šodien",
    subtitle: "Zvaniet mums vai rakstiet SMS — garšīgs ēdiens jūs jau gaida!",
    call: "Zvanīt",
    sms: "SMS",
  },
  en: {
    badge: "Ordering",
    title: "Order your food today",
    subtitle: "Call us or send us an SMS — delicious food is waiting for you!",
    call: "Call",
    sms: "SMS",
  },
  ru: {
    badge: "Заказ",
    title: "Закажите еду уже сегодня",
    subtitle: "Позвоните нам или напишите SMS — вкусная еда уже ждёт вас!",
    call: "Позвонить",
    sms: "SMS",
  },
  uk: {
    badge: "Замовлення",
    title: "Замовте свою їжу вже сьогодні",
    subtitle: "Зателефонуйте нам або напишіть SMS — смачна їжа вже чекає на вас!",
    call: "Зателефонувати",
    sms: "SMS",
  },
} as const;

const ServicesSection = () => {
  const { lang } = useContext(LanguageContext);
  const safeLang = (lang as keyof typeof translations) || "lv";
  const t = translations[safeLang] || translations.lv;

  return (
    <section className="py-24 md:py-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-red-600 via-red-700 to-red-800 shadow-[0_20px_80px_rgba(220,38,38,0.35)]"
        >
          <div className="relative px-6 py-14 text-center md:px-12 md:py-20">
            <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
              <div
                className="h-full w-full"
                style={{
                  backgroundImage: "radial-gradient(rgba(255,255,255,0.55) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
            </div>

            <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center">
              <span className="mb-5 block text-sm font-semibold uppercase tracking-[0.25em] text-white/80">
                {t.badge}
              </span>

              <h2 className="mb-6 font-display text-4xl font-bold leading-tight text-white md:text-6xl">{t.title}</h2>

              <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/85 md:text-xl">{t.subtitle}</p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={`tel:${PHONE_NUMBER}`}
                  className="inline-flex min-w-[200px] items-center justify-center gap-3 rounded-2xl bg-white px-8 py-4 text-base font-semibold text-red-700 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-100 md:text-lg"
                >
                  <Phone className="h-5 w-5" />
                  {t.call}
                </a>

                <a
                  href={`sms:${PHONE_NUMBER}`}
                  className="inline-flex min-w-[180px] items-center justify-center gap-3 rounded-2xl border border-white/25 bg-white/10 px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/15 md:text-lg"
                >
                  <MessageCircle className="h-5 w-5" />
                  {t.sms}
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
