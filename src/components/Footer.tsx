import { useContext, useEffect, useMemo, useState } from "react";
import { Phone, MapPin, Clock, Instagram } from "lucide-react";
import { LanguageContext } from "@/App";
import { useTranslatedTexts } from "@/hooks/use-translate";

const HOURS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRYKPdl7ZFecNaYuGHbmePFREkzHclGioRQdwEhiDmy_RbvGqiFCuGKz0FOpEDtkXNUE9UEH90PJIOf/pub?gid=0&single=true&output=csv";

type HourRow = {
  day: string;
  open: string;
  close: string;
};

const translations = {
  lv: {
    brandText: "Kebabi · Rēzekne",
    freshFood: "Svaigs ēdiens katru dienu.",
    address: "Adrese",
    workingHours: "Darba laiks",
    contacts: "Kontakti",
    menu: "Ēdienkarte",
    contactLink: "Kontakti",
    instagram: "Instagram",
    copyright: "SEDO Restorāns. Visas tiesības aizsargātas.",
    fallbackHours: ["P–Pk: 10:00 – 22:00", "Se: 11:00 – 23:00", "Sv: 11:00 – 21:00"],
  },
  en: {
    brandText: "Kebabs · Rezekne",
    freshFood: "Fresh food every day.",
    address: "Address",
    workingHours: "Working hours",
    contacts: "Contacts",
    menu: "Menu",
    contactLink: "Contacts",
    instagram: "Instagram",
    copyright: "SEDO Restaurant. All rights reserved.",
    fallbackHours: ["Mon–Fri: 10:00 – 22:00", "Sat: 11:00 – 23:00", "Sun: 11:00 – 21:00"],
  },
  ru: {
    brandText: "Кебабы · Резекне",
    freshFood: "Свежая еда каждый день.",
    address: "Адрес",
    workingHours: "Часы работы",
    contacts: "Контакты",
    menu: "Меню",
    contactLink: "Контакты",
    instagram: "Instagram",
    copyright: "Ресторан SEDO. Все права защищены.",
    fallbackHours: ["Пн–Пт: 10:00 – 22:00", "Сб: 11:00 – 23:00", "Вс: 11:00 – 21:00"],
  },
  uk: {
    brandText: "Кебаби · Резекне",
    freshFood: "Свіжа їжа щодня.",
    address: "Адреса",
    workingHours: "Години роботи",
    contacts: "Контакти",
    menu: "Меню",
    contactLink: "Контакти",
    instagram: "Instagram",
    copyright: "Ресторан SEDO. Усі права захищені.",
    fallbackHours: ["Пн–Пт: 10:00 – 22:00", "Сб: 11:00 – 23:00", "Нд: 11:00 – 21:00"],
  },
} as const;

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

  const dayNames = useMemo(() => hours.map((h) => h.day), [hours]);
  const translatedDays = useTranslatedTexts(dayNames);

  return (
    <footer className="border-t border-border/50 py-16">
      <div className="container">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="font-display text-2xl font-bold text-primary">SEDO</span>
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
              Atbrīvošanas aleja 172A
              <br />
              Rēzekne, LV-4601
            </p>
          </div>

          <div>
            <h4 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
              <Clock className="h-4 w-4 text-accent" />
              {t.workingHours}
            </h4>

            <div className="space-y-1 text-sm text-muted-foreground">
              {hours.length > 0
                ? hours.map((item, i) => (
                    <p key={item.day}>
                      {translatedDays[i] ?? item.day}: {item.open} – {item.close}
                    </p>
                  ))
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
