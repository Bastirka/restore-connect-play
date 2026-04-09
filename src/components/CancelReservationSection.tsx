import { useState } from "react";
import { XCircle, Hash, Phone, Loader2 } from "lucide-react";

const RESERVATION_API_URL = "https://reservation-api.raivisbabris99.workers.dev/";

export default function CancelReservationSection() {
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
      setError("Ievadiet rezervācijas ID");
      return;
    }

    if (!phone.trim()) {
      setError("Ievadiet telefona numuru");
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
        throw new Error("Server error");
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data?.error === "NOT_FOUND"
            ? "Rezervācija nav atrasta"
            : data?.error === "CONTACT_MISMATCH"
              ? "Telefona numurs nesakrīt"
              : data?.message || "Atcelšana neizdevās",
        );
      }

      setSuccess("Rezervācija veiksmīgi atcelta");

      setReservationId("");
      setPhone("");
    } catch (err) {
      console.error(err);

      setError(err instanceof Error ? err.message : "Atcelšana neizdevās");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-2xl">
      <div className="mb-6">
        <h3 className="text-xl font-semibold md:text-2xl">Atcelt rezervāciju</h3>

        <p className="mt-1 text-sm text-white/60 md:text-base">Ievadiet rezervācijas ID un telefona numuru.</p>
      </div>

      <form
        onSubmit={handleCancel}
        className="space-y-5 rounded-[24px] border border-white/10 bg-[#111] p-4 shadow-2xl md:p-7"
      >
        <div>
          <label className="mb-2 flex items-center gap-2 text-white/85">
            <Hash size={18} className="text-amber-400" />
            Rezervācijas ID *
          </label>

          <input
            type="text"
            value={reservationId}
            onChange={(e) => setReservationId(e.target.value)}
            className={inputClass}
            placeholder="13068499"
            required
          />
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-white/85">
            <Phone size={18} className="text-amber-400" />
            Telefons *
          </label>

          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            placeholder="+371..."
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

          {loading ? "Atceļ..." : "Atcelt rezervāciju"}
        </button>
      </form>
    </div>
  );
}
