import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Plus, Search, Loader2, RefreshCw } from "lucide-react";
import { menuApi, AuthError } from "@/lib/adminApi";
import type { AdminMenuItem } from "@/types/admin";

const CATEGORIES = ["kebabi", "burgeri", "pide", "salads", "vegetarian", "kids", "dzerieni", "deserti"];

const emptyItem: AdminMenuItem = { id: "", category: "kebabi", groupName: "", variantName: "", description: "", price: "", image: "", active: true, sortOrder: 0 };

export default function MenuEditor({ onAuthError }: { onAuthError?: () => void }) {
  const [items, setItems] = useState<AdminMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminMenuItem>(emptyItem);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await menuApi.list();
      setItems(data);
    } catch (err) {
      if (err instanceof AuthError) { onAuthError?.(); return; }
      setError(err instanceof Error ? err.message : "Failed to load menu");
    } finally {
      setLoading(false);
    }
  }, [onAuthError]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filtered = items.filter((i) => {
    const matchSearch = !search || `${i.groupName} ${i.variantName} ${i.description}`.toLowerCase().includes(search.toLowerCase());
    const matchCat = !catFilter || i.category === catFilter;
    return matchSearch && matchCat;
  });

  const openNew = () => { setEditing({ ...emptyItem, id: "", sortOrder: items.length + 1 }); setDialogOpen(true); };
  const openEdit = (item: AdminMenuItem) => { setEditing({ ...item }); setDialogOpen(true); };

  const save = async () => {
    try {
      setSaving(true);
      const isNew = !editing.id || !items.find((i) => i.id === editing.id);
      if (isNew) {
        const { id: _, ...rest } = editing;
        await menuApi.create(rest);
      } else {
        await menuApi.update(editing.id, editing);
      }
      setDialogOpen(false);
      await fetchItems();
    } catch (err) {
      if (err instanceof AuthError) { onAuthError?.(); return; }
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await menuApi.remove(id);
      await fetchItems();
    } catch (err) {
      if (err instanceof AuthError) { onAuthError?.(); return; }
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const toggleActive = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    try {
      await menuApi.update(id, { active: !item.active });
      await fetchItems();
    } catch (err) {
      if (err instanceof AuthError) { onAuthError?.(); return; }
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-neutral-400">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading menu…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-900/30 border border-red-800 px-4 py-2 text-sm text-red-300 flex items-center justify-between">
          {error}
          <Button variant="ghost" size="sm" onClick={fetchItems} className="text-red-300 hover:text-red-200"><RefreshCw className="h-4 w-4" /></Button>
        </div>
      )}
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
          <Input placeholder="Search menu…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 border-neutral-700 bg-neutral-800 text-neutral-100 placeholder:text-neutral-500" />
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <Button variant="ghost" size="icon" onClick={fetchItems} className="text-neutral-400 hover:text-neutral-200" title="Refresh"><RefreshCw className="h-4 w-4" /></Button>
        <Button onClick={openNew} className="bg-amber-600 hover:bg-amber-700 text-white"><Plus className="mr-1 h-4 w-4" />Add Item</Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-neutral-800 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-800 hover:bg-transparent">
              <TableHead className="text-neutral-400">Category</TableHead>
              <TableHead className="text-neutral-400">Group</TableHead>
              <TableHead className="text-neutral-400">Variant</TableHead>
              <TableHead className="text-neutral-400">Price</TableHead>
              <TableHead className="text-neutral-400">Active</TableHead>
              <TableHead className="text-neutral-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => (
              <TableRow key={item.id} className="border-neutral-800">
                <TableCell className="text-neutral-300 capitalize">{item.category}</TableCell>
                <TableCell className="text-neutral-100 font-medium">{item.groupName}</TableCell>
                <TableCell className="text-neutral-400">{item.variantName || "—"}</TableCell>
                <TableCell className="text-neutral-100">€{item.price}</TableCell>
                <TableCell><Switch checked={item.active} onCheckedChange={() => toggleActive(item.id)} /></TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(item.id)} className="text-red-400 hover:text-red-300"><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-neutral-500 py-8">No items found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-neutral-700 bg-neutral-900 text-neutral-100 max-h-[90vh] overflow-auto">
          <DialogHeader><DialogTitle>{editing.id && items.find((i) => i.id === editing.id) ? "Edit Item" : "New Item"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label className="text-neutral-400">Category</Label>
                <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1"><Label className="text-neutral-400">Price</Label><Input value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} className="border-neutral-700 bg-neutral-800 text-neutral-100" /></div>
            </div>
            <div className="space-y-1"><Label className="text-neutral-400">Group Name</Label><Input value={editing.groupName} onChange={(e) => setEditing({ ...editing, groupName: e.target.value })} className="border-neutral-700 bg-neutral-800 text-neutral-100" /></div>
            <div className="space-y-1"><Label className="text-neutral-400">Variant Name</Label><Input value={editing.variantName} onChange={(e) => setEditing({ ...editing, variantName: e.target.value })} className="border-neutral-700 bg-neutral-800 text-neutral-100" /></div>
            <div className="space-y-1"><Label className="text-neutral-400">Description</Label><Input value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="border-neutral-700 bg-neutral-800 text-neutral-100" /></div>
            <div className="space-y-1"><Label className="text-neutral-400">Image URL</Label><Input value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} className="border-neutral-700 bg-neutral-800 text-neutral-100" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label className="text-neutral-400">Sort Order</Label><Input type="number" value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })} className="border-neutral-700 bg-neutral-800 text-neutral-100" /></div>
              <div className="flex items-center gap-2 pt-6"><Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} /><Label className="text-neutral-400">Active</Label></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-neutral-700 text-neutral-300">Cancel</Button>
            <Button onClick={save} disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-1" />Saving…</> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
