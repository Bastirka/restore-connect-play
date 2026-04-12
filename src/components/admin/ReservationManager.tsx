import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { reservationsApi, AuthError, type ApiReservation } from "@/lib/adminApi";

const STATUSES = ["pending", "confirmed", "cancelled", "completed"] as const;

const statusColor: Record<string, string> = {
  pending: "bg-yellow-600/20 text-yellow-400",
  confirmed: "bg-green-600/20 text-green-400",
  cancelled: "bg-red-600/20 text-red-400",
  completed: "bg-neutral-700/40 text-neutral-300",
};

export default function ReservationManager({ onAuthError }: { onAuthError?: () => void }) {
  const [data, setData] = useState<ApiReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const list = await reservationsApi.list();
      setData(list);
    } catch (err) {
      if (err instanceof AuthError) { onAuthError?.(); return; }
      setError(err instanceof Error ? err.message : "Failed to load reservations");
    } finally {
      setLoading(false);
    }
  }, [onAuthError]);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  const filtered = data.filter((r) => {
    const matchSearch = !search || `${r.name} ${r.phone} ${r.reservationId}`.toLowerCase().includes(search.toLowerCase());
    const matchDate = !dateFilter || r.date === dateFilter;
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchDate && matchStatus;
  });

  const changeStatus = async (id: string, status: string) => {
    try {
      // Update locally until a real updateStatus endpoint exists
      setData((prev) => prev.map((r) => r.reservationId === id ? { ...r, status } : r));
    } catch (err) {
      if (err instanceof AuthError) { onAuthError?.(); return; }
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-neutral-400">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading reservations…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-900/30 border border-red-800 px-4 py-2 text-sm text-red-300 flex items-center justify-between">
          {error}
          <Button variant="ghost" size="sm" onClick={fetchReservations} className="text-red-300 hover:text-red-200"><RefreshCw className="h-4 w-4" /></Button>
        </div>
      )}
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
          <Input placeholder="Search reservations…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 border-neutral-700 bg-neutral-800 text-neutral-100 placeholder:text-neutral-500" />
        </div>
        <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-44 border-neutral-700 bg-neutral-800 text-neutral-100" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <Button variant="ghost" size="icon" onClick={fetchReservations} className="text-neutral-400 hover:text-neutral-200" title="Refresh"><RefreshCw className="h-4 w-4" /></Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-neutral-800 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-800 hover:bg-transparent">
              <TableHead className="text-neutral-400">ID</TableHead>
              <TableHead className="text-neutral-400">Customer</TableHead>
              <TableHead className="text-neutral-400">Phone</TableHead>
              <TableHead className="text-neutral-400">Date</TableHead>
              <TableHead className="text-neutral-400">Time</TableHead>
              <TableHead className="text-neutral-400">Guests</TableHead>
              <TableHead className="text-neutral-400">Zone</TableHead>
              <TableHead className="text-neutral-400">Status</TableHead>
              <TableHead className="text-neutral-400">Notes</TableHead>
              <TableHead className="text-neutral-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.reservationId} className="border-neutral-800">
                <TableCell className="text-neutral-400 font-mono text-xs">{r.reservationId}</TableCell>
                <TableCell className="text-neutral-100 font-medium">{r.name}</TableCell>
                <TableCell className="text-neutral-300">{r.phone}</TableCell>
                <TableCell className="text-neutral-300">{r.date}</TableCell>
                <TableCell className="text-neutral-300">{r.time}{r.endTime ? `–${r.endTime}` : ""}</TableCell>
                <TableCell className="text-neutral-300">{r.guests}</TableCell>
                <TableCell className="text-neutral-300 capitalize">{r.zone}</TableCell>
                <TableCell>
                  <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", statusColor[r.status])}>
                    {r.status}
                  </span>
                </TableCell>
                <TableCell className="text-neutral-400 text-xs max-w-[120px] truncate">{r.notes || "—"}</TableCell>
                <TableCell className="text-right">
                  <select
                    value={r.status}
                    onChange={(e) => changeStatus(r.reservationId, e.target.value)}
                    className="rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs text-neutral-100"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={10} className="text-center text-neutral-500 py-8">No reservations found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
