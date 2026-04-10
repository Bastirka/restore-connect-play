import { useState, useEffect } from "react";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminLayout, { type AdminView } from "@/components/admin/AdminLayout";
import AdminDashboard from "@/components/admin/AdminDashboard";
import MenuEditor from "@/components/admin/MenuEditor";
import SpecialsEditor from "@/components/admin/SpecialsEditor";
import HoursEditor from "@/components/admin/HoursEditor";
import ReservationManager from "@/components/admin/ReservationManager";
import ImageManager from "@/components/admin/ImageManager";
import { adminVerify, adminLogout } from "@/lib/adminAuth";

export default function Admin() {
  const [authed, setAuthed] = useState<boolean | null>(null); // null = loading
  const [view, setView] = useState<AdminView>("dashboard");

  useEffect(() => {
    adminVerify().then(setAuthed);
  }, []);

  const logout = async () => {
    await adminLogout();
    setAuthed(false);
  };

  // Loading state while verifying session
  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-400">
        Verifying session…
      </div>
    );
  }

  if (!authed) {
    return <AdminLogin onLogin={() => setAuthed(true)} />;
  }

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
