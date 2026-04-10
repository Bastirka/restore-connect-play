import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, CalendarCheck, Clock, Loader2 } from "lucide-react";
import { menuApi, hoursApi, reservationsApi, AuthError } from "@/lib/adminApi";

export default function AdminDashboard({ onAuthError }: { onAuthError?: () => void }) {
  const [loading, setLoading] = useState(true);
  const [menuCount, setMenuCount] = useState(0);
  const [reservationCount, setReservationCount] = useState(0);
  const [todayReservations, setTodayReservations] = useState(0);
  const [openDays, setOpenDays] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [menu, reservations, hours] = await Promise.all([
          menuApi.list().catch(() => []),
          reservationsApi.list().catch(() => []),
          hoursApi.list().catch(() => []),
        ]);
        setMenuCount(menu.length);
        setReservationCount(reservations.length);
        const today = new Date().toISOString().slice(0, 10);
        setTodayReservations(reservations.filter((r) => r.date === today).length);
        setOpenDays(hours.filter((h) => !h.closed).length);
      } catch (err) {
        if (err instanceof AuthError) onAuthError?.();
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [onAuthError]);

  const stats = [
    { label: "Menu Items", value: menuCount, icon: UtensilsCrossed },
    { label: "Reservations Today", value: todayReservations, icon: CalendarCheck },
    { label: "Total Reservations", value: reservationCount, icon: CalendarCheck },
    { label: "Open Days", value: openDays, icon: Clock },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-neutral-400">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading dashboard…
      </div>
    );
  }

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
    </div>
  );
}
