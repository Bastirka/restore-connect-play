import { useContext, useState } from "react";
import { XCircle, Hash, Phone, Loader2 } from "lucide-react";
import { LanguageContext } from "@/App";

const RESERVATION_API_BASE = "https://summer-morning-793e.sedokafe.workers.dev";
const RESERVATION_API_KEY = "sedorestorans2024";

const translations = {
  lv: {
    title: "Atcelt rezervāciju",
    subtitle: "Ievadiet rezervācijas ID un telefona numuru.",
    idLabel: "Rezervācijas ID *",
    idPlaceholder: "13068499",
    phoneLabel: "Telefons *",
    phonePlaceholder: "+371...",
    submit: "Atcelt rezervāciju",
    submitting: "Atceļ...",
    success: "Rezervācija veiksmīgi atcelta",
    errorMissingId: "Ievadiet rezervācijas ID",
    errorMissingPhone: "Ievadiet telefona numuru",
    errorNotFound: "Rezervācija nav atrasta",
    errorContactMismatch: "Telefona numurs nesakrīt",
    errorAlreadyCancelled: "Rezervācija jau ir atcelta",
    errorMissingFields: "Lūdzu, aizpildiet visus obligātos laukus",
    errorDefault: "Atcelšana neizdevās",
    errorServer: "Servera kļūda",
  },
  en: {
    title: "Cancel reservation",
    subtitle: "Enter your reservation ID and phone number.",
    idLabel: "Reservation ID *",
    idPlaceholder: "13068499",
    phoneLabel: "Phone *",
    phonePlaceholder: "+371...",
    submit: "Cancel reservation",
    submitting: "Cancelling...",
    success: "Reservation successfully cancelled",
    errorMissingId: "Enter the reservation ID",
    errorMissingPhone: "Enter the phone number",
    errorNotFound: "Reservation not found",
    errorContactMismatch: "Phone number does not match",
    errorAlreadyCancelled: "Reservation is already cancelled",
    errorMissingFields: "Please fill in all required fields",
    errorDefault: "Cancellation failed",
    errorServer: "Server error",
  },
  ru: {
    title: "Отменить бронирование",
    subtitle: "Введите ID бронирования и номер телефона.",
    idLabel: "ID бронирования *",
    idPlaceholder: "13068499",
    phoneLabel: "Телефон *",
    phonePlaceholder: "+371...",
    submit: "Отменить бронирование",
    submitting: "Отмена...",
    success: "Бронирование успешно отменено",
    errorMissingId: "Введите ID бронирования",
    errorMissingPhone: "Введите номер телефона",
    errorNotFound: "Бронирование не найдено",
    errorContactMismatch: "Номер телефона не совпадает",
    errorAlreadyCancelled: "Бронирование уже отменено",
    errorMissingFields: "Пожалуйста, заполните все обязательные поля",
    errorDefault: "Отмена не удалась",
    errorServer: "Ошибка сервера",
  },
  uk: {
    title: "Скасувати бронювання",
    subtitle: "Введіть ID бронювання та номер телефону.",
    idLabel: "ID бронювання *",
    idPlaceholder: "13068499",
    phoneLabel: "Телефон *",
    phonePlaceholder: "+371...",
    submit: "Скасувати бронювання",
    submitting: "Скасування...",
    success: "Бронювання успішно скасовано",
    errorMissingId: "Введіть ID бронювання",
    errorMissingPhone: "Введіть номер телефону",
    errorNotFound: "Бронювання не знайдено",
    errorContactMismatch: "Номер телефону не збігається",
    errorAlreadyCancelled: "Бронювання вже скасовано",
    errorMissingFields: "Будь ласка, заповніть усі обов’язкові поля",
    errorDefault: "Скасування не вдалося",
    errorServer: "Помилка сервера",
  },
} as const;

function getLocalizedCancelError(
  errorCode: string | undefined,
  t: (typeof translations)[keyof typeof translations],
): string {
  switch (errorCode) {
    case "NOT_FOUND":
      return t.errorNotFound;
    case "CONTACT_MISMATCH":
      return t.errorContactMismatch;
    case "ALREADY_CANCELLED":
      return t.errorAlreadyCancelled;
    case "MISSING_FIELDS":
      return t.errorMissingFields;
    default:
      return t.errorDefault;
  }
}

export default function CancelReservationSection() {
  const { lang } = useContext(LanguageContext);
  const safeLang = (lang as keyof typeof translations) || "lv";
  const t = translations[safeLang] || translations.lv;

  const [reservationId, setReservationId] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputClass =
    "h-14 w-full rounded-[20px] border border-white/10 bg-black px-4 text-base text-white outline-none transition placeholder:text-white/35 focus:border-amber-500/50 md:h-16 md:rounded-[24px] md:px-5 md:text-lg";

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!reservationId.trim()) {
      setError(t.errorMissingId);
      return;
    }

    if (!phone.trim()) {
      setError(t.errorMissingPhone);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        action: "cancel",
        reservationId: reservationId.trim(),
        phone: phone.trim(),
      };

      const response = await fetch(RESERVATION_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();

      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(t.errorServer);
      }

      if (!response.ok || !data.success) {
        throw new Error(getLocalizedCancelError(data?.error, t));
      }

      setSuccess(t.success);
      setReservationId("");
      setPhone("");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : t.errorDefault);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-2xl">
      <div className="mb-6">
        <h3 className="text-xl font-semibold md:text-2xl">{t.title}</h3>

        <p className="mt-1 text-sm text-white/60 md:text-base">{t.subtitle}</p>
      </div>

      <form
        onSubmit={handleCancel}
        className="space-y-5 rounded-[24px] border border-white/10 bg-[#111] p-4 shadow-2xl md:p-7"
      >
        <div>
          <label className="mb-2 flex items-center gap-2 text-white/85">
            <Hash size={18} className="text-amber-400" />
            {t.idLabel}
          </label>

          <input
            type="text"
            value={reservationId}
            onChange={(e) => setReservationId(e.target.value)}
            className={inputClass}
            placeholder={t.idPlaceholder}
            required
          />
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-white/85">
            <Phone size={18} className="text-amber-400" />
            {t.phoneLabel}
          </label>

          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            placeholder={t.phonePlaceholder}
            required
          />
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-300">{error}</div>
        )}

        {success && (
          <div className="rounded-2xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-green-300">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-[20px] border border-red-500/30 bg-red-900/40 text-lg font-semibold text-white hover:bg-red-900/60 disabled:opacity-60"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <XCircle size={20} />}

          {loading ? t.submitting : t.submit}
        </button>
      </form>
    </div>
  );
}
