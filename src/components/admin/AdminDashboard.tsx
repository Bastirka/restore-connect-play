import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, CalendarCheck, Star, ImageIcon } from "lucide-react";

const stats = [
  { label: "Menu Items", value: "42", icon: UtensilsCrossed },
  { label: "Reservations Today", value: "8", icon: CalendarCheck },
  { label: "Active Specials", value: "2", icon: Star },
  { label: "Images", value: "15", icon: ImageIcon },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-neutral-800 bg-neutral-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-neutral-100">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-neutral-800 bg-neutral-900">
        <CardContent className="p-6 text-center text-neutral-500">
          <p>Dashboard analytics and quick actions will be available after backend integration.</p>
        </CardContent>
      </Card>
    </div>
  );
}
