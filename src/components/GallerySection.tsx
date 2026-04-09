import { memo, useCallback, useContext, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn } from "lucide-react";
import { LanguageContext } from "@/App";
import img1 from "@/assets/food-kebab-plate.jpg";
import img2 from "@/assets/food-kebab-plate2.jpg";
import img3 from "@/assets/food-falafel.jpg";
import img4 from "@/assets/food-grill.jpg";
import img5 from "@/assets/food-wrap-plate.jpg";
import img6 from "@/assets/restaurant-exterior.jpg";

const translations = {
  lv: {
    badge: "Foto",
    title: "Galerija",
    close: "Aizvērt",
    images: [
      "Kebaba šķīvis",
      "Kebaba šķīvis ar salātiem",
      "Falafels",
      "Grilēta gaļa",
      "Kebaba wraps",
      "SEDO restorāns",
    ],
  },
  en: {
    badge: "Photos",
    title: "Gallery",
    close: "Close",
    images: ["Kebab plate", "Kebab plate with salad", "Falafel", "Grilled meat", "Kebab wrap", "SEDO restaurant"],
  },
  ru: {
    badge: "Фото",
    title: "Галерея",
    close: "Закрыть",
    images: ["Тарелка кебаба", "Тарелка кебаба с салатом", "Фалафель", "Жареное мясо", "Кебаб-ролл", "Ресторан SEDO"],
  },
  uk: {
    badge: "Фото",
    title: "Галерея",
    close: "Закрити",
    images: ["Тарілка кебабу", "Тарілка кебабу з салатом", "Фалафель", "Смажене м'ясо", "Кебаб-рол", "Ресторан SEDO"],
  },
};

const imageSources = [img1, img2, img3, img4, img5, img6];

const GallerySection = () => {
  const { lang } = useContext(LanguageContext);
  const safeLang = (lang as keyof typeof translations) || "lv";
  const t = translations[safeLang] || translations.lv;
  const [selected, setSelected] = useState<number | null>(null);

  const images = useMemo(
    () => imageSources.map((src, i) => ({ src, alt: t.images[i] })),
    [t],
  );

  const handleClose = useCallback(() => setSelected(null), []);

  return (
    <section id="gallery" className="py-24 md:py-32 bg-secondary/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-[0.25em] mb-5 block">{t.badge}</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">{t.title}</h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {images.map((img, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setSelected(i)}
              className="overflow-hidden rounded-2xl aspect-square group cursor-pointer relative"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
                decoding="async"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-background/0 group-hover:bg-background/30 transition-all duration-300 flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <button
              className="absolute top-6 right-6 text-foreground/60 hover:text-foreground transition-colors p-2"
              onClick={handleClose}
              aria-label={t.close}
            >
              <X className="w-8 h-8" />
            </button>

            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={images[selected].src}
              alt={images[selected].alt}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default GallerySection;
