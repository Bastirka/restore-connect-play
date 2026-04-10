import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, RefreshCw, Save } from "lucide-react";
import { hoursApi, AuthError } from "@/lib/adminApi";
import type { AdminHours } from "@/types/admin";

export default function HoursEditor({ onAuthError }: { onAuthError?: () => void }) {
  const [hours, setHours] = useState<AdminHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchHours = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await hoursApi.list();
      setHours(data);
      setDirty(false);
    } catch (err) {
      if (err instanceof AuthError) { onAuthError?.(); return; }
      setError(err instanceof Error ? err.message : "Failed to load hours");
    } finally {
      setLoading(false);
    }
  }, [onAuthError]);

  useEffect(() => { fetchHours(); }, [fetchHours]);

  const update = (idx: number, patch: Partial<AdminHours>) => {
    setHours((prev) => prev.map((h, i) => (i === idx ? { ...h, ...patch } : h)));
    setDirty(true);
    setSuccess("");
  };

  const saveHours = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const data = await hoursApi.update(hours);
      setHours(data);
      setDirty(false);
      setSuccess("Hours saved successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      if (err instanceof AuthError) { onAuthError?.(); return; }
      setError(err instanceof Error ? err.message : "Failed to save hours");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-neutral-400">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading hours…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-900/30 border border-red-800 px-4 py-2 text-sm text-red-300 flex items-center justify-between">
          {error}
          <Button variant="ghost" size="sm" onClick={fetchHours} className="text-red-300 hover:text-red-200"><RefreshCw className="h-4 w-4" /></Button>
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-900/30 border border-green-800 px-4 py-2 text-sm text-green-300">{success}</div>
      )}

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={fetchHours} className="text-neutral-400 hover:text-neutral-200" title="Refresh"><RefreshCw className="h-4 w-4" /></Button>
        <Button onClick={saveHours} disabled={!dirty || saving} className="bg-amber-600 hover:bg-amber-700 text-white">
          {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-1" />Saving…</> : <><Save className="h-4 w-4 mr-1" />Save Hours</>}
        </Button>
      </div>

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
    </div>
  );
}
