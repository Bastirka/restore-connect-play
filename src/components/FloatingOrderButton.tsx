import { useContext } from "react";
import { Phone } from "lucide-react";
import { motion } from "framer-motion";
import { LanguageContext } from "@/App";

const translations = {
  lv: {
    call: "Zvanīt",
  },
  en: {
    call: "Call",
  },
  ru: {
    call: "Позвонить",
  },
  uk: {
    call: "Зателефонувати",
  },
};

const FloatingOrderButton = () => {
  const { lang } = useContext(LanguageContext);
  const t = translations[lang];

  return (
    <motion.a
      href="tel:+37127000057"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.5, type: "spring" }}
      className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:bg-primary/90 hover:scale-105 transition-all duration-300 md:hidden"
      aria-label={t.call}
    >
      <Phone className="w-6 h-6" />
    </motion.a>
  );
};

export default FloatingOrderButton;
