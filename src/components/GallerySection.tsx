import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
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
  const [selectedSnap, setSelectedSnap] = useState(0);

  const autoplayPlugin = useMemo(
    () =>
      Autoplay({
        delay: 3000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    [],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: typeof window !== "undefined" && window.innerWidth < 640 ? 1 : 2,
      duration: 25,
    },
    [autoplayPlugin],
  );

  const images = useMemo(
    () => imageSources.map((src, i) => ({ src, alt: t.images[i] })),
    [t],
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const handleClose = useCallback(() => setSelected(null), []);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedSnap(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  const dotCount = emblaApi?.scrollSnapList().length ?? imageSources.length;

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

        {/* Carousel */}
        <div className="relative group/carousel">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-3 md:-ml-4">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="min-w-0 shrink-0 grow-0 pl-3 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3"
                >
                  <button
                    onClick={() => setSelected(i)}
                    className="overflow-hidden rounded-2xl aspect-square group cursor-pointer relative w-full"
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-background/0 group-hover:bg-background/30 transition-all duration-300 flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Arrows */}
          <button
            onClick={scrollPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/60 hover:bg-background/80 text-foreground rounded-full p-2 transition-all duration-200 backdrop-blur-sm"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/60 hover:bg-background/80 text-foreground rounded-full p-2 transition-all duration-200 backdrop-blur-sm"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: dotCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === selectedSnap ? "bg-accent w-6" : "bg-foreground/30 hover:bg-foreground/50"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
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
