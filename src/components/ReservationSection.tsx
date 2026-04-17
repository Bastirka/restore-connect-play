import { useContext, useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { CalendarDays, Clock, Users, MessageSquare, Utensils, Send, ChevronDown } from "lucide-react";
import { LanguageContext } from "@/App";
import CancelReservationSection from "./CancelReservationSection";

const RESERVATION_API_BASE = "https://summer-morning-793e.sedokafe.workers.dev";
const RESERVATION_API_KEY = "sedorestorans2024";

const translations = {
  lv: {
    badge: "Rezervācija",
    title: "Rezervēt galdiņu",
    subtitle: "Izvēlieties datumu, laiku un vietu. Sistēma automātiski pārbaudīs pieejamību.",

    nameLabel: "Vārds *",
    namePlaceholder: "Jūsu vārds",

    phoneLabel: "Telefons *",
    phonePlaceholder: "+371...",

    emailLabel: "E-pasts",
    emailPlaceholder: "jusu.epasts@gmail.com",

    dateLabel: "Datums *",
    timeFromLabel: "No *",
    timeUntilLabel: "Līdz *",
    timePlaceholder: "Izvēlieties laiku",
    timeError: "Beigu laikam jābūt vēlākam par sākuma laiku.",

    guestsLabel: "Personu skaits *",
    zoneLabel: "Vieta *",

    notesLabel: "Piezīmes",
    notesPlaceholder: "Papildu vēlmes...",

    checkingAvailability: "Pārbauda pieejamību...",
    noTable: "Šajā laikā piemērotu galdu nav.",
    freePlaces: "Brīvas vietas",
    suggestedTables: "Ieteiktie galdi",

    submit: "Rezervēt galdiņu",
    submitting: "Nosūta...",

    success: "Rezervācija veiksmīgi izveidota!",
    reservationId: "Rezervācijas ID",
    saveId: "Saglabājiet šo ID, ja vēlaties atcelt rezervāciju.",
    note: "Piezīme",

    submitFailed: "Rezervāciju neizdevās nosūtīt",
    availabilityFailed: "Pieejamības pārbaude neizdevās",

    zones: {
      central: "Centrālā zāle",
      vip: "VIP",
      entrance: "Pie ieejas",
      whole: "Viss restorāns",
    },
  },

  en: {
    badge: "Reservation",
    title: "Reserve a table",
    subtitle: "Choose the date, time and seating area. The system will automatically check availability.",

    nameLabel: "Name *",
    namePlaceholder: "Your name",

    phoneLabel: "Phone *",
    phonePlaceholder: "+371...",

    emailLabel: "Email",
    emailPlaceholder: "your.email@gmail.com",

    dateLabel: "Date *",
    timeFromLabel: "From *",
    timeUntilLabel: "Until *",
    timePlaceholder: "Select time",
    timeError: "End time must be later than start time.",

    guestsLabel: "Number of guests *",
    zoneLabel: "Seating area *",

    notesLabel: "Notes",
    notesPlaceholder: "Additional requests...",

    checkingAvailability: "Checking availability...",
    noTable: "No suitable table is available at this time.",
    freePlaces: "Free places",
    suggestedTables: "Suggested tables",

    submit: "Reserve a table",
    submitting: "Sending...",

    success: "Reservation created successfully!",
    reservationId: "Reservation ID",
    saveId: "Save this ID if you want to cancel the reservation.",
    note: "Note",

    submitFailed: "Failed to send reservation",
    availabilityFailed: "Availability check failed",

    zones: {
      central: "Main hall",
      vip: "VIP",
      entrance: "Near entrance",
      whole: "Whole restaurant",
    },
  },

  ru: {
    badge: "Бронирование",
    title: "Забронировать столик",
    subtitle: "Выберите дату, время и место. Система автоматически проверит доступность.",

    nameLabel: "Имя *",
    namePlaceholder: "Ваше имя",

    phoneLabel: "Телефон *",
    phonePlaceholder: "+371...",

    emailLabel: "E-mail",
    emailPlaceholder: "your.email@gmail.com",

    dateLabel: "Дата *",
    timeFromLabel: "С *",
    timeUntilLabel: "До *",
    timePlaceholder: "Выберите время",
    timeError: "Время окончания должно быть позже времени начала.",

    guestsLabel: "Количество гостей *",
    zoneLabel: "Место *",

    notesLabel: "Примечания",
    notesPlaceholder: "Дополнительные пожелания...",

    checkingAvailability: "Проверяем доступность...",
    noTable: "Подходящего столика на это время нет.",
    freePlaces: "Свободных мест",
    suggestedTables: "Рекомендуемые столы",

    submit: "Забронировать столик",
    submitting: "Отправка...",

    success: "Бронирование успешно создано!",
    reservationId: "ID бронирования",
    saveId: "Сохраните этот ID, если захотите отменить бронирование.",
    note: "Примечание",

    submitFailed: "Не удалось отправить бронирование",
    availabilityFailed: "Не удалось проверить доступность",

    zones: {
      central: "Центральный зал",
      vip: "VIP",
      entrance: "У входа",
      whole: "Весь ресторан",
    },
  },

  uk: {
    badge: "Бронювання",
    title: "Забронювати столик",
    subtitle: "Оберіть дату, час і місце. Система автоматично перевірить наявність.",

    nameLabel: "Ім'я *",
    namePlaceholder: "Ваше ім'я",

    phoneLabel: "Телефон *",
    phonePlaceholder: "+371...",

    emailLabel: "E-mail",
    emailPlaceholder: "your.email@gmail.com",

    dateLabel: "Дата *",
    timeFromLabel: "З *",
    timeUntilLabel: "До *",
    timePlaceholder: "Оберіть час",
    timeError: "Час завершення має бути пізніше за час початку.",

    guestsLabel: "Кількість гостей *",
    zoneLabel: "Місце *",

    notesLabel: "Примітки",
    notesPlaceholder: "Додаткові побажання...",

    checkingAvailability: "Перевіряємо доступність...",
    noTable: "На цей час відповідного столика немає.",
    freePlaces: "Вільних місць",
    suggestedTables: "Рекомендовані столи",

    submit: "Забронювати столик",
    submitting: "Надсилання...",

    success: "Бронювання успішно створено!",
    reservationId: "ID бронювання",
    saveId: "Збережіть цей ID, якщо захочете скасувати бронювання.",
    note: "Примітка",

    submitFailed: "Не вдалося надіслати бронювання",
    availabilityFailed: "Не вдалося перевірити наявність",

    zones: {
      central: "Центральний зал",
      vip: "VIP",
      entrance: "Біля входу",
      whole: "Увесь ресторан",
    },
  },
} as const;

function FieldShell({ children, icon, label }: { children: React.ReactNode; icon?: React.ReactNode; label: string }) {
  return (
    <div className="min-w-0">
      <label className="mb-2 flex items-center gap-2 text-base text-white/85 md:text-lg">
        {icon}
        <span className="min-w-0">{label}</span>
      </label>
      {children}
    </div>
  );
}

function SelectChevron() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-white/45">
      <ChevronDown size={20} />
    </div>
  );
}

async function postJson(url: string, payload: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  console.log("POST URL:", url);
  console.log("POST PAYLOAD:", payload);
  console.log("RAW RESPONSE:", text);

  let data: any = null;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Server returned invalid JSON from ${url}`);
  }

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || data?.error || "Request failed");
  }

  return data;
}

export default function ReservationSection() {
  const { lang } = useContext(LanguageContext);
  const t = translations[lang as keyof typeof translations] || translations.lv;

  const zoneOptions = [
    { value: "Centrālā zāle", label: t.zones.central },
    { value: "VIP", label: t.zones.vip },
    { value: "Pie ieejas", label: t.zones.entrance },
    { value: "Viss restorāns", label: t.zones.whole },
  ];

  const timeOptions = [
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
    "21:30",
  ];

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [guests, setGuests] = useState("2");
  const [zone, setZone] = useState("Centrālā zāle");
  const [notes, setNotes] = useState("");

  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData | null>(null);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const inputClass =
    "h-14 w-full min-w-0 rounded-[20px] border border-white/10 bg-black px-4 text-base text-white outline-none transition placeholder:text-white/35 focus:border-amber-500/50 md:h-16 md:rounded-[24px] md:px-5 md:text-lg";

  const selectClass =
    "h-14 w-full min-w-0 appearance-none rounded-[20px] border border-white/10 bg-black px-4 pr-12 text-base text-white outline-none transition focus:border-amber-500/50 md:h-16 md:rounded-[24px] md:px-5 md:pr-14 md:text-lg";

  const textareaClass =
    "w-full min-w-0 rounded-[20px] border border-white/10 bg-black px-4 py-4 text-base text-white outline-none transition placeholder:text-white/35 focus:border-amber-500/50 md:rounded-[24px] md:px-5 md:text-lg";

  const timeRangeValid = !time || !endTime || endTime > time;

  const checkAvailability = async () => {
    try {
      if (!date || !time || !endTime || !zone || !guests || !timeRangeValid) {
        setAvailabilityError("");
        setAvailabilityData(null);
        return;
      }

      setAvailabilityLoading(true);
      setAvailabilityError("");

      const data = await postJson(RESERVATION_API_URL, {
        action: "availability",
        date,
        time,
        endTime,
        guests: Number(guests),
        zone,
      });

      setAvailabilityData(data as AvailabilityData);
      setAvailabilityError("");
    } catch (error) {
      setAvailabilityData(null);
      setAvailabilityError(error instanceof Error ? error.message : t.availabilityFailed);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  useEffect(() => {
    if (!date || !time || !endTime || !zone || !guests || !timeRangeValid) {
      setAvailabilityError("");
      setAvailabilityData(null);
      return;
    }

    const timer = setTimeout(() => {
      checkAvailability();
    }, 300);

    return () => clearTimeout(timer);
  }, [date, time, endTime, zone, guests]);

  const canSubmit =
    !submitLoading &&
    !availabilityLoading &&
    timeRangeValid &&
    !!name.trim() &&
    !!phone.trim() &&
    !!date &&
    !!time &&
    !!endTime &&
    !!zone &&
    availabilityData?.available !== false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) return;

    try {
      setSubmitLoading(true);
      setSubmitError("");
      setSubmitSuccess("");

      const payload = {
        action: "create",
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        date,
        time,
        endTime,
        guests: Number(guests),
        zone,
        notes: notes.trim(),
      };

      const data = await postJson(RESERVATION_API_URL, payload);
      const warning = data?.warning || "";
      const reservationId = data?.reservationId || "";

      setSubmitSuccess(
        `${t.success}\n${t.reservationId}: ${reservationId}\n${time}–${endTime}\n${t.saveId}${warning ? `\n\n${t.note}: ${warning}` : ""}`,
      );

      setName("");
      setPhone("");
      setEmail("");
      setDate("");
      setTime("");
      setEndTime("");
      setGuests("2");
      setZone("Centrālā zāle");
      setNotes("");
      setAvailabilityData(null);
      setAvailabilityError("");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : t.submitFailed);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <section id="reservation" className="scroll-mt-28 bg-[#0b0b0b] px-3 py-12 text-white md:px-4 md:py-16">
      <div className="mx-auto max-w-2xl overflow-hidden">
        <ScrollReveal className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-300">
            <Utensils size={16} />
            {t.badge}
          </div>

          <h2 className="text-2xl font-semibold leading-tight md:text-4xl">{t.title}</h2>

          <p className="mt-2 text-sm text-white/70 md:text-base">{t.subtitle}</p>
        </ScrollReveal>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 overflow-hidden rounded-[24px] border border-white/10 bg-[#111111] p-4 shadow-2xl md:rounded-[28px] md:p-7"
        >
          <FieldShell label={t.nameLabel}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputClass}
              placeholder={t.namePlaceholder}
            />
          </FieldShell>

          <FieldShell label={t.phoneLabel}>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className={inputClass}
              placeholder={t.phonePlaceholder}
              inputMode="tel"
            />
          </FieldShell>

          <FieldShell label={t.emailLabel}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder={t.emailPlaceholder}
              inputMode="email"
            />
          </FieldShell>

          <FieldShell
            label={t.dateLabel}
            icon={<CalendarDays size={18} className="shrink-0 text-amber-400 md:size-5" />}
          >
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={inputClass} />
          </FieldShell>

          <div className="grid grid-cols-2 gap-3">
            <FieldShell label={t.timeFromLabel} icon={<Clock size={18} className="shrink-0 text-amber-400 md:size-5" />}>
              <div className="relative min-w-0">
                <select value={time} onChange={(e) => setTime(e.target.value)} required className={selectClass}>
                  <option value="">{t.timePlaceholder}</option>
                  {timeOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <SelectChevron />
              </div>
            </FieldShell>

            <FieldShell label={t.timeUntilLabel} icon={<Clock size={18} className="shrink-0 text-amber-400 md:size-5" />}>
              <div className="relative min-w-0">
                <select value={endTime} onChange={(e) => setEndTime(e.target.value)} required className={selectClass}>
                  <option value="">{t.timePlaceholder}</option>
                  {timeOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <SelectChevron />
              </div>
            </FieldShell>
          </div>

          {time && endTime && !timeRangeValid && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300 md:text-base">
              {t.timeError}
            </div>
          )}

          <FieldShell label={t.guestsLabel} icon={<Users size={18} className="shrink-0 text-amber-400 md:size-5" />}>
            <input
              type="number"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              required
              min={1}
              max={50}
              inputMode="numeric"
              className={inputClass}
            />
          </FieldShell>

          <FieldShell label={t.zoneLabel} icon={<Utensils size={18} className="shrink-0 text-amber-400 md:size-5" />}>
            <div className="relative min-w-0">
              <select value={zone} onChange={(e) => setZone(e.target.value)} required className={selectClass}>
                {zoneOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <SelectChevron />
            </div>
          </FieldShell>

          {availabilityLoading && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200 md:text-base">
              {t.checkingAvailability}
            </div>
          )}

          {availabilityError && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300 md:text-base">
              {availabilityError}
            </div>
          )}

          {availabilityData && !availabilityError && (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm md:text-base ${
                availabilityData.available
                  ? "border-green-500/40 bg-green-500/10 text-green-300"
                  : "border-red-500/40 bg-red-500/10 text-red-300"
              }`}
            >
              {availabilityData.available
                ? `${t.freePlaces}: ${availabilityData.remaining}. ${t.suggestedTables}: ${
                    availabilityData.suggestedTables.join(", ") || "-"
                  }`
                : t.noTable}
            </div>
          )}

          <FieldShell
            label={t.notesLabel}
            icon={<MessageSquare size={18} className="shrink-0 text-amber-400 md:size-5" />}
          >
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className={textareaClass}
              placeholder={t.notesPlaceholder}
            />
          </FieldShell>

          {submitError && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300 md:text-base">
              {submitError}
            </div>
          )}

          {submitSuccess && (
            <div className="whitespace-pre-line rounded-2xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-300 md:text-base">
              {submitSuccess}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="flex h-14 w-full items-center justify-center gap-3 rounded-[20px] bg-[#9d1c1c] px-6 text-lg font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 md:h-16 md:rounded-[24px] md:text-2xl"
          >
            <Send size={20} />
            {submitLoading ? t.submitting : t.submit}
          </button>
        </form>

        <CancelReservationSection />
      </div>
    </section>
  );
}
