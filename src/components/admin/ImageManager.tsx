import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Trash2, Copy, ImageIcon } from "lucide-react";
import type { AdminImage } from "@/types/admin";

const MOCK: AdminImage[] = [
  { id: "1", url: "/src/assets/food-kebab-plate.jpg", name: "food-kebab-plate.jpg", assignedTo: "Menu: Adana Kebab", uploadedAt: "2026-04-01" },
  { id: "2", url: "/src/assets/restaurant-exterior.jpg", name: "restaurant-exterior.jpg", assignedTo: "Hero Section", uploadedAt: "2026-03-15" },
];

export default function ImageManager() {
  const [images, setImages] = useState<AdminImage[]>(MOCK);
  const [urlInput, setUrlInput] = useState("");

  const addByUrl = () => {
    if (!urlInput.trim()) return;
    const name = urlInput.split("/").pop() || "image";
    setImages((prev) => [...prev, { id: crypto.randomUUID(), url: urlInput.trim(), name, assignedTo: "", uploadedAt: new Date().toISOString().slice(0, 10) }]);
    setUrlInput("");
  };

  const remove = (id: string) => setImages((p) => p.filter((i) => i.id !== id));
  const copyUrl = (url: string) => navigator.clipboard.writeText(url);

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <div className="rounded-lg border-2 border-dashed border-neutral-700 p-8 text-center">
        <Upload className="mx-auto h-10 w-10 text-neutral-500 mb-3" />
        <p className="text-neutral-400 text-sm mb-1">Drag & drop images here or use URL below</p>
        <p className="text-neutral-500 text-xs">Image upload will be available after backend integration</p>
      </div>

      {/* Add by URL */}
      <div className="flex gap-2">
        <div className="flex-1 space-y-1">
          <Label className="text-neutral-400">Image URL</Label>
          <Input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://example.com/image.jpg" className="border-neutral-700 bg-neutral-800 text-neutral-100 placeholder:text-neutral-500" />
        </div>
        <Button onClick={addByUrl} className="self-end bg-amber-600 hover:bg-amber-700 text-white">Add</Button>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {images.map((img) => (
          <Card key={img.id} className="border-neutral-800 bg-neutral-900 overflow-hidden">
            <div className="aspect-video bg-neutral-800 flex items-center justify-center">
              <img
                src={img.url}
                alt={img.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="flex items-center justify-center h-full"><svg class="h-8 w-8 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg></div>';
                }}
              />
            </div>
            <CardContent className="p-3 space-y-1">
              <p className="text-sm font-medium text-neutral-100 truncate">{img.name}</p>
              <p className="text-xs text-neutral-500">{img.assignedTo || "Unassigned"}</p>
              <div className="flex gap-1 pt-1">
                <Button variant="ghost" size="sm" onClick={() => copyUrl(img.url)} className="text-neutral-400 hover:text-neutral-100"><Copy className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="sm" onClick={() => remove(img.id)} className="text-red-400 hover:text-red-300"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {images.length === 0 && (
          <div className="col-span-full text-center py-8">
            <ImageIcon className="mx-auto h-10 w-10 text-neutral-600 mb-2" />
            <p className="text-neutral-500">No images yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
