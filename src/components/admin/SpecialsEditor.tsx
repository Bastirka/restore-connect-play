import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2, Plus } from "lucide-react";
import type { AdminSpecial } from "@/types/admin";

const MOCK: AdminSpecial[] = [
  { id: "1", title: "Weekend Kebab Feast", subtitle: "20% off all kebabs", image: "", buttonText: "Order Now", buttonLink: "#", active: true, startDate: "2026-04-10", endDate: "2026-04-30", sortOrder: 1 },
];

const empty: AdminSpecial = { id: "", title: "", subtitle: "", image: "", buttonText: "", buttonLink: "", active: true, startDate: "", endDate: "", sortOrder: 0 };

export default function SpecialsEditor() {
  const [items, setItems] = useState<AdminSpecial[]>(MOCK);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminSpecial>(empty);

  const openNew = () => { setEditing({ ...empty, id: crypto.randomUUID(), sortOrder: items.length + 1 }); setDialogOpen(true); };
  const openEdit = (s: AdminSpecial) => { setEditing({ ...s }); setDialogOpen(true); };
  const save = () => {
    setItems((prev) => { const idx = prev.findIndex((i) => i.id === editing.id); if (idx >= 0) { const n = [...prev]; n[idx] = editing; return n; } return [...prev, editing]; });
    setDialogOpen(false);
  };
  const remove = (id: string) => setItems((p) => p.filter((i) => i.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={openNew} className="bg-amber-600 hover:bg-amber-700 text-white"><Plus className="mr-1 h-4 w-4" />Add Special</Button></div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((s) => (
          <Card key={s.id} className="border-neutral-800 bg-neutral-900">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-neutral-100">{s.title}</p>
                  <p className="text-sm text-neutral-400">{s.subtitle}</p>
                </div>
                <Switch checked={s.active} onCheckedChange={() => setItems((p) => p.map((i) => i.id === s.id ? { ...i, active: !i.active } : i))} />
              </div>
              <p className="text-xs text-neutral-500">{s.startDate} → {s.endDate}</p>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="sm" onClick={() => remove(s.id)} className="text-red-400 hover:text-red-300"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && <p className="text-neutral-500 col-span-full text-center py-8">No specials yet</p>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-neutral-700 bg-neutral-900 text-neutral-100 max-h-[90vh] overflow-auto">
          <DialogHeader><DialogTitle>{items.find((i) => i.id === editing.id) ? "Edit Special" : "New Special"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1"><Label className="text-neutral-400">Title</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="border-neutral-700 bg-neutral-800 text-neutral-100" /></div>
            <div className="space-y-1"><Label className="text-neutral-400">Subtitle</Label><Input value={editing.subtitle} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} className="border-neutral-700 bg-neutral-800 text-neutral-100" /></div>
            <div className="space-y-1"><Label className="text-neutral-400">Image URL</Label><Input value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} className="border-neutral-700 bg-neutral-800 text-neutral-100" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label className="text-neutral-400">Button Text</Label><Input value={editing.buttonText} onChange={(e) => setEditing({ ...editing, buttonText: e.target.value })} className="border-neutral-700 bg-neutral-800 text-neutral-100" /></div>
              <div className="space-y-1"><Label className="text-neutral-400">Button Link</Label><Input value={editing.buttonLink} onChange={(e) => setEditing({ ...editing, buttonLink: e.target.value })} className="border-neutral-700 bg-neutral-800 text-neutral-100" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label className="text-neutral-400">Start Date</Label><Input type="date" value={editing.startDate} onChange={(e) => setEditing({ ...editing, startDate: e.target.value })} className="border-neutral-700 bg-neutral-800 text-neutral-100" /></div>
              <div className="space-y-1"><Label className="text-neutral-400">End Date</Label><Input type="date" value={editing.endDate} onChange={(e) => setEditing({ ...editing, endDate: e.target.value })} className="border-neutral-700 bg-neutral-800 text-neutral-100" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label className="text-neutral-400">Sort Order</Label><Input type="number" value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })} className="border-neutral-700 bg-neutral-800 text-neutral-100" /></div>
              <div className="flex items-center gap-2 pt-6"><Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} /><Label className="text-neutral-400">Active</Label></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-neutral-700 text-neutral-300">Cancel</Button>
            <Button onClick={save} className="bg-amber-600 hover:bg-amber-700 text-white">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
