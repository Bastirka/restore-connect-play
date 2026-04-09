import { useContext, useEffect, useMemo, useState } from "react";
import { ExternalLink, Star } from "lucide-react";
import { LanguageContext } from "@/App";

type Review = {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description?: string;
  time?: number;
};

type PlaceDetails = {
  name: string;
  rating: number;
  user_ratings_total: number;
  url?: string;
  reviews: Review[];
};

const translations = {
  lv: {
    badge: "Atsauksmes",
    title: "Ko saka mūsu viesi",
    subtitle: "Oficiālās Google atsauksmes un vērtējums.",
    basedOn: "Balstīts uz",
    reviewsWord: "atsauksmēm",
    readMore: "Skatīt Google",
    loading: "Ielādējam atsauksmes...",
    googleUnavailable: "Google atsauksmes šobrīd nav pieejamas.",
    noReviews: "Google neatdeva nevienu publisku atsauksmi.",
    noPlaceData: "Google vietas dati nav pieejami.",
  },
  en: {
    badge: "Reviews",
    title: "What our guests say",
    subtitle: "Official Google reviews and rating.",
    basedOn: "Based on",
    reviewsWord: "reviews",
    readMore: "View on Google",
    loading: "Loading reviews...",
    googleUnavailable: "Google reviews are currently unavailable.",
    noReviews: "Google did not return any public reviews.",
    noPlaceData: "Google place data is unavailable.",
  },
  ru: {
    badge: "Отзывы",
    title: "Что говорят наши гости",
    subtitle: "Официальные отзывы и рейтинг Google.",
    basedOn: "На основе",
    reviewsWord: "отзывов",
    readMore: "Смотреть в Google",
    loading: "Загружаем отзывы...",
    googleUnavailable: "Отзывы Google сейчас недоступны.",
    noReviews: "Google не вернул публичные отзывы.",
    noPlaceData: "Данные места Google недоступны.",
  },
  uk: {
    badge: "Відгуки",
    title: "Що кажуть наші гості",
    subtitle: "Офіційні відгуки та рейтинг Google.",
    basedOn: "На основі",
    reviewsWord: "відгуків",
    readMore: "Дивитися в Google",
    loading: "Завантажуємо відгуки...",
    googleUnavailable: "Відгуки Google зараз недоступні.",
    noReviews: "Google не повернув публічні відгуки.",
    noPlaceData: "Дані місця Google недоступні.",
  },
} as const;

function loadGoogleMaps(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Window is undefined"));
      return;
    }

    if (window.google?.maps?.places) {
      resolve();
      return;
    }

    const existingScript = document.querySelector('script[data-google-maps="true"]') as HTMLScriptElement | null;

    if (existingScript) {
      const onLoad = () => {
        if (window.google?.maps?.places) resolve();
        else reject(new Error("Google Maps loaded but Places API missing"));
      };

      const onError = () => {
        reject(new Error("Failed to load existing Google Maps script"));
      };

      existingScript.addEventListener("load", onLoad, { once: true });
      existingScript.addEventListener("error", onError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.setAttribute("data-google-maps", "true");

    script.onload = () => {
      if (window.google?.maps?.places) resolve();
      else reject(new Error("Google Maps loaded but Places API missing"));
    };

    script.onerror = () => {
      reject(new Error("Failed to load Google Maps script"));
    };

    document.head.appendChild(script);
  });
}

function getPlaceDetails(placeId: string): Promise<PlaceDetails> {
  return new Promise((resolve, reject) => {
    try {
      if (!window.google?.maps?.places) {
        reject(new Error("Google Places API unavailable"));
        return;
      }

      const container = document.createElement("div");
      const service = new window.google.maps.places.PlacesService(container);

      service.getDetails(
        {
          placeId,
          fields: ["name", "rating", "user_ratings_total", "reviews", "url"],
        },
        (place: any, status: string) => {
          if (status !== window.google.maps.places.PlacesServiceStatus.OK || !place) {
            reject(new Error(`PlacesService failed with status: ${status}`));
            return;
          }

          const reviews: Review[] = Array.isArray(place.reviews)
            ? place.reviews
                .map((review: any) => ({
                  author_name: review.author_name || "Google user",
                  rating: Number(review.rating || 0),
                  text: review.text || "",
                  relative_time_description: review.relative_time_description || "",
                  time: review.time,
                }))
                .filter((review: Review) => review.text.trim().length > 0)
            : [];

          resolve({
            name: place.name || "",
            rating: Number(place.rating || 0),
            user_ratings_total: Number(place.user_ratings_total || 0),
            url: place.url || "",
            reviews,
          });
        },
      );
    } catch (error) {
      reject(error);
    }
  });
}

function renderStars(rating: number, size = 16) {
  return Array.from({ length: 5 }).map((_, index) => {
    const filled = index < Math.round(rating);

    return (
      <Star
        key={`${rating}-${index}`}
        size={size}
        className={filled ? "fill-yellow-400 text-yellow-400" : "text-white/20"}
      />
    );
  });
}

function getSafeLang(lang: string) {
  if (lang === "en" || lang === "ru" || lang === "uk") return lang;
  return "lv";
}

const ReviewsSection = () => {
  const { lang } = useContext(LanguageContext);
  const safeLang = getSafeLang(lang) as keyof typeof translations;
  const t = translations[safeLang];

  const [placeData, setPlaceData] = useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleAvailable, setGoogleAvailable] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const placeId = "ChIJ4Y34IQAXwkYREqZLq8_s1WQ";

  useEffect(() => {
    let isMounted = true;

    async function loadReviews() {
      try {
        if (!apiKey || !placeId) {
          if (isMounted) {
            setGoogleAvailable(false);
            setPlaceData(null);
            setLoading(false);
          }
          return;
        }

        await loadGoogleMaps(apiKey);
        const details = await getPlaceDetails(placeId);

        if (!isMounted) return;

        setPlaceData(details);
        setGoogleAvailable(true);
      } catch (error) {
        console.error("Failed to load Google reviews:", error);

        if (!isMounted) return;

        setGoogleAvailable(false);
        setPlaceData(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadReviews();

    return () => {
      isMounted = false;
    };
  }, [apiKey, placeId]);

  const reviewList = useMemo(() => {
    if (!placeData?.reviews?.length) return [];
    return [...placeData.reviews]
      .sort((a, b) => {
        const timeDiff = (b.time || 0) - (a.time || 0);
        if (timeDiff !== 0) return timeDiff;
        return (b.rating || 0) - (a.rating || 0);
      })
      .slice(0, 3);
  }, [placeData]);

  return (
    <section id="reviews" className="py-24">
      <div className="container">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <span className="inline-flex rounded-full border border-yellow-400/20 bg-yellow-400/10 px-4 py-1 text-sm font-medium text-yellow-300">
              {t.badge}
            </span>

            <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">{t.title}</h2>

            <p className="mx-auto mt-4 max-w-2xl text-white/65">{t.subtitle}</p>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center text-white/60">
              {t.loading}
            </div>
          ) : !googleAvailable || !placeData ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center text-white/60">
              {t.googleUnavailable}
            </div>
          ) : (
            <>
              <div className="mb-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-white/40">Google</p>

                    <h3 className="mt-2 text-2xl font-bold text-white">{placeData.name || t.noPlaceData}</h3>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <span className="text-4xl font-bold text-white">
                        {placeData.rating ? placeData.rating.toFixed(1) : "—"}
                      </span>

                      <div className="flex items-center gap-1">{renderStars(placeData.rating || 0, 18)}</div>

                      <span className="text-white/60">
                        {t.basedOn}{" "}
                        <span className="font-semibold text-white">{placeData.user_ratings_total || 0}</span>{" "}
                        {t.reviewsWord}
                      </span>
                    </div>
                  </div>

                  {placeData.url ? (
                    <a
                      href={placeData.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-5 py-3 text-sm font-semibold text-yellow-300 transition hover:bg-yellow-400/15"
                    >
                      {t.readMore}
                      <ExternalLink size={16} />
                    </a>
                  ) : null}
                </div>
              </div>

              {reviewList.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {reviewList.map((review, index) => (
                    <article
                      key={`${review.author_name}-${review.time || index}`}
                      className="rounded-3xl border border-white/10 bg-black p-6 transition-all duration-300 hover:border-yellow-400/20"
                    >
                      <div className="mb-4 flex items-center gap-1">{renderStars(review.rating || 0)}</div>

                      <p className="min-h-[96px] text-sm leading-relaxed text-white/75">{review.text}</p>

                      <div className="mt-6 border-t border-white/10 pt-4">
                        <p className="font-semibold text-white">{review.author_name}</p>

                        {review.relative_time_description ? (
                          <p className="mt-1 text-xs text-white/45">{review.relative_time_description}</p>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center text-white/60">
                  {t.noReviews}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
