import { useContext, useState } from "react";
import { XCircle, Hash, Loader2 } from "lucide-react";
import { LanguageContext } from "@/App";

const RESERVATION_API_BASE = "https://summer-morning-793e.sedokafe.workers.dev";
const RESERVATION_API_KEY = "sedorestorans2024";

const translations = {
  lv: {
    title: "Atcelt rezervāciju",
    subtitle: "Ievadiet rezervācijas ID.",
    idLabel: "Rezervācijas ID *",
    idPlaceholder: "SEDO-123456",
    submit: "Atcelt rezervāciju",
    submitting: "Atceļ...",
    success: "Rezervācija veiksmīgi atcelta",
    errorMissingId: "Ievadiet rezervācijas ID",
    errorNotFound: "Rezervācija nav atrasta",
    errorAlreadyCancelled: "Rezervācija jau ir atcelta",
    errorDefault: "Atcelšana neizdevās",
    errorServer: "Servera kļūda",
  },
  en: {
    title: "Cancel reservation",
    subtitle: "Enter your reservation ID.",
    idLabel: "Reservation ID *",
    idPlaceholder: "SEDO-123456",
    submit: "Cancel reservation",
    submitting: "Cancelling...",
    success: "Reservation successfully cancelled",
    errorMissingId: "Enter the reservation ID",
    errorNotFound: "Reservation not found",
    errorAlreadyCancelled: "Reservation is already cancelled",
    errorDefault: "Cancellation failed",
    errorServer: "Server error",
  },
  ru: {
    title: "Отменить бронирование",
    subtitle: "Введите ID бронирования.",
    idLabel: "ID бронирования *",
    idPlaceholder: "SEDO-123456",
    submit: "Отменить бронирование",
    submitting: "Отмена...",
    success: "Бронирование успешно отменено",
    errorMissingId: "Введите ID бронирования",
    errorNotFound: "Бронирование не найдено",
    errorAlreadyCancelled: "Бронирование уже отменено",
    errorDefault: "Отмена не удалась",
    errorServer: "Ошибка сервера",
  },
  uk: {
    title: "Скасувати бронювання",
    subtitle: "Введіть ID бронювання.",
    idLabel: "ID бронювання *",
    idPlaceholder: "SEDO-123456",
    submit: "Скасувати бронювання",
    submitting: "Скасування...",
    success: "Бронювання успішно скасовано",
    errorMissingId: "Введіть ID бронювання",
    errorNotFound: "Бронювання не знайдено",
    errorAlreadyCancelled: "Бронювання вже скасовано",
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
    case "ALREADY_CANCELLED":
      return t.errorAlreadyCancelled;
    default:
      return t.errorDefault;
  }
}

export default function CancelReservationSection() {
  const { lang } = useContext(LanguageContext);
  const safeLang = (lang as keyof typeof translations) || "lv";
  const t = translations[safeLang] || translations.lv;

  const [reservationId, setReservationId] = useState("");
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

    try {
      setLoading(true);

      const payload = {
        reservationId: reservationId.trim(),
      };

      const response = await fetch(`${RESERVATION_API_BASE}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": RESERVATION_API_KEY,
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

      const isOk = data?.ok === true || data?.success === true;
      if (!response.ok || !isOk) {
        throw new Error(getLocalizedCancelError(data?.error || data?.code, t));
      }

      setSuccess(data?.alreadyCancelled ? t.errorAlreadyCancelled : t.success);
      setReservationId("");
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
