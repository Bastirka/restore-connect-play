import { useContext } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Navigation, ExternalLink } from "lucide-react";
import { LanguageContext } from "@/App";

const translations = {
  lv: {
    badge: "Atrašanās vieta",
    title: "Kur mūs atrast",
    subtitle: "Mēs atrodamies Rēzeknē — ērti sasniedzami un viegli atrodami kartē.",
    address: "Atbrīvošanas aleja 172A, Rēzekne, LV-4601",
    phone: "+371 27 000 057",
    getDirections: "Kā nokļūt",
    openInMaps: "Atvērt kartēs",
    mapTitle: "SEDO restorāna atrašanās vieta",
  },
  en: {
    badge: "Location",
    title: "Where to find us",
    subtitle: "We are located in Rezekne — easy to reach and easy to find on the map.",
    address: "Atbrīvošanas aleja 172A, Rēzekne, LV-4601",
    phone: "+371 27 000 057",
    getDirections: "Get directions",
    openInMaps: "Open in Maps",
    mapTitle: "SEDO restaurant location",
  },
  ru: {
    badge: "Местоположение",
    title: "Где нас найти",
    subtitle: "Мы находимся в Резекне — нас легко найти и удобно добраться.",
    address: "Atbrīvošanas aleja 172A, Rēzekne, LV-4601",
    phone: "+371 27 000 057",
    getDirections: "Как добраться",
    openInMaps: "Открыть в картах",
    mapTitle: "Местоположение ресторана SEDO",
  },
  uk: {
    badge: "Місцезнаходження",
    title: "Де нас знайти",
    subtitle: "Ми знаходимося в Резекне — нас легко знайти та зручно дістатися.",
    address: "Atbrīvošanas aleja 172A, Rēzekne, LV-4601",
    phone: "+371 27 000 057",
    getDirections: "Як дістатися",
    openInMaps: "Відкрити в картах",
    mapTitle: "Розташування ресторану SEDO",
  },
} as const;

// Vari lietot arī precīzākas koordinātas, ja vajag.
const MAP_QUERY = encodeURIComponent("SEDO Restaurant Kebabs&Pizza, Atbrīvošanas aleja 172A, Rēzekne, LV-4601");
const MAP_COORDS = "56.5097,27.3167";

const GOOGLE_MAPS_EMBED_URL = `https://maps.google.com/maps?q=${MAP_QUERY}&t=&z=17&ie=UTF8&iwloc=B&output=embed`;
const GOOGLE_MAPS_OPEN_URL = `https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`;
const GOOGLE_MAPS_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${MAP_QUERY}`;

const LocationSection = () => {
  const { lang } = useContext(LanguageContext);
  const normalizedLang = (lang as string) === "ua" ? "uk" : lang;
  const safeLang = (normalizedLang as keyof typeof translations) || "lv";
  const t = translations[safeLang] || translations.lv;

  return (
    <section id="location" className="py-24 md:py-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <span className="mb-5 block text-sm font-semibold uppercase tracking-[0.25em] text-accent">{t.badge}</span>

          <h2 className="mb-4 font-display text-4xl font-bold text-foreground md:text-5xl">{t.title}</h2>

          <p className="text-lg text-muted-foreground">{t.subtitle}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
        >
          <div className="relative aspect-video w-full overflow-hidden">
            <iframe
              src={GOOGLE_MAPS_EMBED_URL}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={t.mapTitle}
              className="h-full w-full"
            />

            <a
              href={GOOGLE_MAPS_OPEN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black shadow-md transition hover:bg-white/90"
            >
              {t.openInMaps}
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <div className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                {t.address}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-accent" />
                <a href="tel:+37127000057" className="font-semibold text-accent hover:underline">
                  {t.phone}
                </a>
              </div>

              <div className="text-xs text-muted-foreground/70">{MAP_COORDS}</div>
            </div>

            <a
              href={GOOGLE_MAPS_DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Navigation className="h-4 w-4" />
              {t.getDirections}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LocationSection;
