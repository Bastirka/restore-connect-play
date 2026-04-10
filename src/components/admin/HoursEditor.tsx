import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AdminHours } from "@/types/admin";

const INITIAL: AdminHours[] = [
  { day: "Monday", openTime: "11:00", closeTime: "22:00", closed: false },
  { day: "Tuesday", openTime: "11:00", closeTime: "22:00", closed: false },
  { day: "Wednesday", openTime: "11:00", closeTime: "22:00", closed: false },
  { day: "Thursday", openTime: "11:00", closeTime: "22:00", closed: false },
  { day: "Friday", openTime: "11:00", closeTime: "23:00", closed: false },
  { day: "Saturday", openTime: "12:00", closeTime: "23:00", closed: false },
  { day: "Sunday", openTime: "12:00", closeTime: "21:00", closed: false },
];

export default function HoursEditor() {
  const [hours, setHours] = useState<AdminHours[]>(INITIAL);

  const update = (idx: number, patch: Partial<AdminHours>) =>
    setHours((prev) => prev.map((h, i) => (i === idx ? { ...h, ...patch } : h)));

  return (
    <div className="rounded-lg border border-neutral-800 overflow-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-neutral-800 hover:bg-transparent">
            <TableHead className="text-neutral-400">Day</TableHead>
            <TableHead className="text-neutral-400">Open</TableHead>
            <TableHead className="text-neutral-400">Close</TableHead>
            <TableHead className="text-neutral-400">Closed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hours.map((h, i) => (
            <TableRow key={h.day} className="border-neutral-800">
              <TableCell className="font-medium text-neutral-100">{h.day}</TableCell>
              <TableCell>
                <Input
                  type="time"
                  value={h.openTime}
                  disabled={h.closed}
                  onChange={(e) => update(i, { openTime: e.target.value })}
                  className="w-32 border-neutral-700 bg-neutral-800 text-neutral-100 disabled:opacity-40"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="time"
                  value={h.closeTime}
                  disabled={h.closed}
                  onChange={(e) => update(i, { closeTime: e.target.value })}
                  className="w-32 border-neutral-700 bg-neutral-800 text-neutral-100 disabled:opacity-40"
                />
              </TableCell>
              <TableCell>
                <Switch checked={h.closed} onCheckedChange={(v) => update(i, { closed: v })} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
