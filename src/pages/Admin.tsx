import { useState, useEffect } from "react";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminLayout, { type AdminView } from "@/components/admin/AdminLayout";
import AdminDashboard from "@/components/admin/AdminDashboard";
import MenuEditor from "@/components/admin/MenuEditor";
import SpecialsEditor from "@/components/admin/SpecialsEditor";
import HoursEditor from "@/components/admin/HoursEditor";
import ReservationManager from "@/components/admin/ReservationManager";
import ImageManager from "@/components/admin/ImageManager";

export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("admin-auth") === "true");
  const [view, setView] = useState<AdminView>("dashboard");

  const logout = () => {
    sessionStorage.removeItem("admin-auth");
    setAuthed(false);
  };

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;

  const content: Record<AdminView, React.ReactNode> = {
    dashboard: <AdminDashboard />,
    menu: <MenuEditor />,
    specials: <SpecialsEditor />,
    hours: <HoursEditor />,
    reservations: <ReservationManager />,
    images: <ImageManager />,
  };

  return (
    <AdminLayout activeView={view} onNavigate={setView} onLogout={logout}>
      {content[view]}
    </AdminLayout>
  );
}
