/// <reference types="google.maps" />
import { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Users, Award } from "lucide-react";
import exteriorImg from "@/assets/restaurant-exterior.jpg";
import { LanguageContext } from "@/App";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const PLACE_ID = "ChIJ4Y34IQAXwkYREqZLq8_s1WQ";

const translations = {
  lv: {
    badge: "Par mums",
    title1: "Turku tradīcijas",
    title2: "Rēzeknē",
    description:
      "SEDO restorāns piedāvā svaigus kebabus un ātrās maltītes, kas gatavotas no kvalitatīvām sastāvdaļām. Pie mums varat baudīt ēdienu uz vietas, paņemt to līdzņemšanai vai izmantot piegādes iespēju.",
    googleRating: "Google vērtējums",
    reviews: "Atsauksmes",
    since: "Kopš",
    sinceBadge: "Rēzeknē kopš 2026. gada",
    imageAlt: "SEDO restorāns no ārpuses",
  },
  en: {
    badge: "About us",
    title1: "Turkish traditions",
    title2: "in Rezekne",
    description:
      "SEDO restaurant offers fresh kebabs and quick meals made from quality ingredients. You can enjoy your meal on site, take it away or use delivery options.",
    googleRating: "Google rating",
    reviews: "Reviews",
    since: "Since",
    sinceBadge: "Serving Rezekne since 2026",
    imageAlt: "SEDO restaurant exterior",
  },
  ru: {
    badge: "О нас",
    title1: "Турецкие традиции",
    title2: "в Резекне",
    description:
      "Ресторан SEDO предлагает свежие кебабы и быстрые блюда, приготовленные из качественных ингредиентов. У нас можно поесть на месте, взять еду с собой или воспользоваться доставкой.",
    googleRating: "Рейтинг Google",
    reviews: "Отзывы",
    since: "С",
    sinceBadge: "В Резекне с 2026 года",
    imageAlt: "Ресторан SEDO снаружи",
  },
  uk: {
    badge: "Про нас",
    title1: "Турецькі традиції",
    title2: "у Резекне",
    description:
      "Ресторан SEDO пропонує свіжі кебаби та швидкі страви, приготовані з якісних інгредієнтів. У нас можна поїсти на місці, взяти їжу із собою або скористатися доставкою.",
    googleRating: "Рейтинг Google",
    reviews: "Відгуки",
    since: "З",
    sinceBadge: "У Резекне з 2026 року",
    imageAlt: "Ресторан SEDO зовні",
  },
} as const;

type GooglePlaceStats = {
  rating: number;
  user_ratings_total: number;
};

declare global {
  interface Window {
    google?: typeof google;
    __googleMapsScriptLoadingPromise?: Promise<void>;
  }
}

function loadGoogleMaps(apiKey: string) {
  if (window.google?.maps?.places) {
    return Promise.resolve();
  }

  if (window.__googleMapsScriptLoadingPromise) {
    return window.__googleMapsScriptLoadingPromise;
  }

  window.__googleMapsScriptLoadingPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[data-google-maps="true"]') as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Google Maps script failed to load")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.setAttribute("data-google-maps", "true");

    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps script failed to load"));

    document.head.appendChild(script);
  });

  return window.__googleMapsScriptLoadingPromise;
}

const AboutSection = () => {
  const { lang } = useContext(LanguageContext);
  const safeLang = (lang as keyof typeof translations) || "lv";
  const t = translations[safeLang] || translations.lv;

  const [googleStats, setGoogleStats] = useState<GooglePlaceStats | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchGoogleStats() {
      if (!GOOGLE_MAPS_API_KEY) {
        console.warn("[AboutSection] Missing API key");
        return;
      }

      try {
        await loadGoogleMaps(GOOGLE_MAPS_API_KEY);

        if (!window.google?.maps?.places) {
          throw new Error("Google Places library not available");
        }

        const service = new window.google.maps.places.PlacesService(document.createElement("div"));

        const details = await new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
          service.getDetails(
            {
              placeId: PLACE_ID,
              fields: ["rating", "user_ratings_total"],
            },
            (result, status) => {
              if (status === window.google!.maps.places.PlacesServiceStatus.OK && result) {
                resolve(result);
              } else {
                reject(new Error(`Place details failed: ${status}`));
              }
            },
          );
        });

        console.log("Google details:", {
          rating: details.rating,
          user_ratings_total: details.user_ratings_total,
          placeId: PLACE_ID,
        });

        if (cancelled) return;

        if (typeof details.rating === "number" && typeof details.user_ratings_total === "number") {
          setGoogleStats({
            rating: details.rating,
            user_ratings_total: details.user_ratings_total,
          });
        } else {
          setGoogleStats(null);
        }
      } catch (err) {
        console.error("[AboutSection] Google fetch failed:", err);
        if (!cancelled) {
          setGoogleStats(null);
        }
      }
    }

    fetchGoogleStats();

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = [
    {
      icon: Star,
      value: googleStats ? googleStats.rating.toFixed(1) : "—",
      label: t.googleRating,
      color: "text-accent",
    },
    {
      icon: Users,
      value: googleStats ? String(googleStats.user_ratings_total) : "—",
      label: t.reviews,
      color: "text-primary",
    },
    {
      icon: Award,
      value: "2026",
      label: t.since,
      color: "text-accent",
    },
  ];

  return (
    <section id="about" className="py-24 md:py-32">
      <div className="container">
        <div className="grid items-center gap-16 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-5 block text-sm font-semibold uppercase tracking-[0.25em] text-accent">{t.badge}</span>

            <h2 className="mb-8 font-display text-4xl font-bold leading-tight text-foreground md:text-5xl">
              {t.title1}
              <br />
              <span className="text-primary">{t.title2}</span>
            </h2>

            <p className="mb-10 text-lg leading-relaxed text-muted-foreground">{t.description}</p>

            <div className="grid grid-cols-3 gap-6">
              {stats.map((s) => (
                <div key={s.label} className="rounded-2xl border border-border/50 bg-card p-5 text-center">
                  <s.icon className={`mx-auto mb-3 h-5 w-5 ${s.color}`} />
                  <div className={`mb-1 text-2xl font-bold md:text-3xl ${s.color}`}>{s.value}</div>
                  <div className="text-xs font-medium text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-3xl shadow-card">
              <img src={exteriorImg} alt={t.imageAlt} className="aspect-[4/3] w-full object-cover" loading="lazy" decoding="async" sizes="(max-width: 768px) 100vw, 50vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
            </div>

            <div className="absolute -bottom-5 -left-5 rounded-2xl bg-primary px-7 py-4 text-sm font-bold tracking-wide text-primary-foreground shadow-lg shadow-primary/20">
              {t.sinceBadge}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
