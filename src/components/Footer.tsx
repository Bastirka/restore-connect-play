import { useContext, useEffect, useState } from "react";
import { Phone, MapPin, Clock, Instagram, Facebook } from "lucide-react";
import { LanguageContext } from "@/App";

const HOURS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRYKPdl7ZFecNaYuGHbmePFREkzHclGioRQdwEhiDmy_RbvGqiFCuGKz0FOpEDtkXNUE9UEH90PJIOf/pub?gid=0&single=true&output=csv";

type HourRow = {
  day: string;
  open: string;
  close: string;
};

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

const translations = {
  lv: {
    dayNames: { mon: "Pirmdiena", tue: "Otrdiena", wed: "Trešdiena", thu: "Ceturtdiena", fri: "Piektdiena", sat: "Sestdiena", sun: "Svētdiena" },
    brandText: "Kebabi · Rēzekne",
    freshFood: "Svaigs ēdiens katru dienu.",
    address: "Adrese",
    addressLines: ["Atbrīvošanas aleja 172A", "Rēzekne, LV-4601"],
    workingHours: "Darba laiks",
    contacts: "Kontakti",
    menu: "Ēdienkarte",
    contactLink: "Kontakti",
    instagram: "Instagram",
    facebook: "Facebook",
    tiktok: "TikTok",
    copyright: "SEDO Restorāns. Visas tiesības aizsargātas.",
    fallbackHours: [
      "Pirmdiena: 10:30 – 22:00",
      "Otrdiena: 10:30 – 22:00",
      "Trešdiena: 10:30 – 22:00",
      "Ceturtdiena: 10:30 – 22:00",
      "Piektdiena: 10:30 – 23:00",
      "Sestdiena: 11:00 – 23:00",
      "Svētdiena: 11:00 – 22:00",
    ],
  },
  en: {
    dayNames: { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" },
    brandText: "Kebabs · Rezekne",
    freshFood: "Fresh food every day.",
    address: "Address",
    addressLines: ["Atbrīvošanas aleja 172A", "Rezekne, LV-4601"],
    workingHours: "Working hours",
    contacts: "Contacts",
    menu: "Menu",
    contactLink: "Contacts",
    instagram: "Instagram",
    facebook: "Facebook",
    tiktok: "TikTok",
    copyright: "SEDO Restaurant. All rights reserved.",
    fallbackHours: [
      "Monday: 10:30 – 22:00",
      "Tuesday: 10:30 – 22:00",
      "Wednesday: 10:30 – 22:00",
      "Thursday: 10:30 – 22:00",
      "Friday: 10:30 – 23:00",
      "Saturday: 11:00 – 23:00",
      "Sunday: 11:00 – 22:00",
    ],
  },
  ru: {
    dayNames: { mon: "Понедельник", tue: "Вторник", wed: "Среда", thu: "Четверг", fri: "Пятница", sat: "Суббота", sun: "Воскресенье" },
    brandText: "Кебабы · Резекне",
    freshFood: "Свежая еда каждый день.",
    address: "Адрес",
    addressLines: ["Atbrīvošanas aleja 172A", "Резекне, LV-4601"],
    workingHours: "Часы работы",
    contacts: "Контакты",
    menu: "Меню",
    contactLink: "Контакты",
    instagram: "Instagram",
    facebook: "Facebook",
    tiktok: "TikTok",
    copyright: "Ресторан SEDO. Все права защищены.",
    fallbackHours: [
      "Понедельник: 10:30 – 22:00",
      "Вторник: 10:30 – 22:00",
      "Среда: 10:30 – 22:00",
      "Четверг: 10:30 – 22:00",
      "Пятница: 10:30 – 23:00",
      "Суббота: 11:00 – 23:00",
      "Воскресенье: 11:00 – 22:00",
    ],
  },
  uk: {
    dayNames: { mon: "Понеділок", tue: "Вівторок", wed: "Середа", thu: "Четвер", fri: "П’ятниця", sat: "Субота", sun: "Неділя" },
    brandText: "Кебаби · Резекне",
    freshFood: "Свіжа їжа щодня.",
    address: "Адреса",
    addressLines: ["Atbrīvošanas aleja 172A", "Резекне, LV-4601"],
    workingHours: "Години роботи",
    contacts: "Контакти",
    menu: "Меню",
    contactLink: "Контакти",
    instagram: "Instagram",
    facebook: "Facebook",
    tiktok: "TikTok",
    copyright: "Ресторан SEDO. Усі права захищені.",
    fallbackHours: [
      "Понеділок: 10:30 – 22:00",
      "Вівторок: 10:30 – 22:00",
      "Середа: 10:30 – 22:00",
      "Четвер: 10:30 – 22:00",
      "П’ятниця: 10:30 – 23:00",
      "Субота: 11:00 – 23:00",
      "Неділя: 11:00 – 22:00",
    ],
  },
} as const;

const DAY_ALIASES: Record<DayKey, string[]> = {
  mon: ["mon", "monday", "pirmdiena", "понедельник", "понеділок"],
  tue: ["tue", "tuesday", "otrdiena", "вторник", "вівторок"],
  wed: ["wed", "wednesday", "trešdiena", "tresdiena", "среда", "середа"],
  thu: ["thu", "thursday", "ceturtdiena", "четверг", "четвер"],
  fri: ["fri", "friday", "piektdiena", "пятница", "п’ятниця", "pyatnytsia"],
  sat: ["sat", "saturday", "sestdiena", "суббота", "субота"],
  sun: ["sun", "sunday", "svētdiena", "svetdiena", "воскресенье", "неділя"],
};

const FACEBOOK_URL = "https://www.facebook.com/share/1B1DncH9VS/?mibextid=wwXIfr";

const TIKTOK_URL = "https://www.tiktok.com/@sedorestaurant?_r=1&_t=ZN-95eKWVxJ9qY";

function normalizeText(value: string) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getDayKey(day: string): DayKey | null {
  const normalized = normalizeText(day);

  for (const [dayKey, aliases] of Object.entries(DAY_ALIASES) as [DayKey, string[]][]) {
    if (aliases.some((alias) => normalized === alias)) {
      return dayKey;
    }
  }

  return null;
}

function parseCsvLine(line: string) {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result.map((value) => value.replace(/^"|"$/g, ""));
}

const TikTokIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.225V2h-3.227v12.264c0 1.303-1.04 2.363-2.324 2.363a2.333 2.333 0 0 1-2.323-2.363 2.333 2.333 0 0 1 2.323-2.364c.243 0 .477.039.698.11V8.728a5.55 5.55 0 0 0-.698-.044A5.59 5.59 0 0 0 4.7 14.264a5.59 5.59 0 0 0 5.568 5.58 5.59 5.59 0 0 0 5.568-5.58V8.018a7.98 7.98 0 0 0 4.664 1.493V6.286a4.76 4.76 0 0 1-.911-.09Z" />
  </svg>
);

const Footer = () => {
  const { lang } = useContext(LanguageContext);
  const safeLang = (lang as keyof typeof translations) || "lv";
  const t = translations[safeLang] || translations.lv;

  const [hours, setHours] = useState<HourRow[]>([]);

  useEffect(() => {
    async function loadHours() {
      try {
        const res = await fetch(HOURS_CSV_URL);
        const text = await res.text();

        const lines = text
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        if (lines.length <= 1) {
          setHours([]);
          return;
        }

        const data = lines
          .slice(1)
          .map((line) => {
            const [day, open, close] = parseCsvLine(line);
            return {
              day: day || "",
              open: open || "",
              close: close || "",
            };
          })
          .filter((item) => item.day && item.open && item.close);

        setHours(data);
      } catch (error) {
        console.error("Neizdevās ielādēt footer darba laikus:", error);
      }
    }

    loadHours();
  }, []);

  return (
    <footer className="border-t border-border/50 py-16">
      <div
        className="container"
        style={{
          opacity: 0,
          animation: "stagger-fade-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards",
        }}
      >
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="font-display text-2xl font-bold text-primary">SEDO Kebabi un Picas</span>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t.brandText}
              <br />
              {t.freshFood}
            </p>
          </div>

          <div>
            <h4 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              {t.address}
            </h4>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t.addressLines[0]}
              <br />
              {t.addressLines[1]}
            </p>
          </div>

          <div>
            <h4 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
              <Clock className="h-4 w-4 text-accent" />
              {t.workingHours}
            </h4>

            <div className="space-y-1 text-sm text-muted-foreground">
              {hours.length > 0
                ? hours.map((item) => {
                    const dayKey = getDayKey(item.day);
                    const dayLabel = dayKey ? t.dayNames[dayKey] : item.day;

                    return (
                      <p key={`${item.day}-${item.open}-${item.close}`}>
                        {dayLabel}: {item.open} – {item.close}
                      </p>
                    );
                  })
                : t.fallbackHours.map((row) => <p key={row}>{row}</p>)}
            </div>
          </div>

          <div>
            <h4 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
              <Phone className="h-4 w-4 text-primary" />
              {t.contacts}
            </h4>

            <div className="flex flex-col gap-3">
              <a href="tel:+37127000057" className="text-sm font-semibold text-accent hover:underline">
                +371 27 000 057
              </a>

              <a
                href="https://www.instagram.com/sedorestaurant?igsh=MXhlZHQ4a3d0Yjcycw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
                aria-label={t.instagram}
              >
                <Instagram className="h-4 w-4" />
                <span>@sedorestaurant</span>
              </a>

              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
                aria-label={t.facebook}
              >
                <Facebook className="h-4 w-4" />
                <span>Facebook</span>
              </a>

              <a
                href={TIKTOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
                aria-label={t.tiktok}
              >
                <TikTokIcon className="h-4 w-4" />
                <span>@sedorestaurant</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 text-xs text-muted-foreground sm:flex-row">
          <span>
            © {new Date().getFullYear()} {t.copyright}
          </span>

          <div className="flex items-center gap-6">
            <a href="#menu" className="transition-colors hover:text-foreground">
              {t.menu}
            </a>
            <a href="#contact" className="transition-colors hover:text-foreground">
              {t.contactLink}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
