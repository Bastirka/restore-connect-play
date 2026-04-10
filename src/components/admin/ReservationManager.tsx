import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminReservation } from "@/types/admin";

const STATUSES = ["pending", "confirmed", "cancelled", "completed"] as const;

const MOCK: AdminReservation[] = [
  { id: "R001", customerName: "Jānis Bērziņš", phone: "+371 20000001", date: "2026-04-12", time: "18:00", guests: 4, zone: "hall", status: "pending", notes: "" },
  { id: "R002", customerName: "Anna Liepa", phone: "+371 20000002", date: "2026-04-12", time: "19:30", guests: 2, zone: "terrace", status: "confirmed", notes: "Birthday" },
  { id: "R003", customerName: "Oleg Petrov", phone: "+371 20000003", date: "2026-04-11", time: "20:00", guests: 6, zone: "hall", status: "completed", notes: "" },
];

const statusColor: Record<string, string> = {
  pending: "bg-yellow-600/20 text-yellow-400",
  confirmed: "bg-green-600/20 text-green-400",
  cancelled: "bg-red-600/20 text-red-400",
  completed: "bg-neutral-700/40 text-neutral-300",
};

export default function ReservationManager() {
  const [data, setData] = useState<AdminReservation[]>(MOCK);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = data.filter((r) => {
    const matchSearch = !search || `${r.customerName} ${r.phone} ${r.id}`.toLowerCase().includes(search.toLowerCase());
    const matchDate = !dateFilter || r.date === dateFilter;
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchDate && matchStatus;
  });

  const changeStatus = (id: string, status: AdminReservation["status"]) =>
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

  return (
    <div className="space-y-4">
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
              <TableRow key={r.id} className="border-neutral-800">
                <TableCell className="text-neutral-400 font-mono text-xs">{r.id}</TableCell>
                <TableCell className="text-neutral-100 font-medium">{r.customerName}</TableCell>
                <TableCell className="text-neutral-300">{r.phone}</TableCell>
                <TableCell className="text-neutral-300">{r.date}</TableCell>
                <TableCell className="text-neutral-300">{r.time}</TableCell>
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
                    onChange={(e) => changeStatus(r.id, e.target.value as AdminReservation["status"])}
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
