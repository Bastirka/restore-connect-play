import { useState } from "react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Star,
  Clock,
  CalendarCheck,
  ImageIcon,
  LogOut,
  Menu as MenuIcon,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminView =
  | "dashboard"
  | "menu"
  | "specials"
  | "hours"
  | "reservations"
  | "images";

interface AdminLayoutProps {
  activeView: AdminView;
  onNavigate: (view: AdminView) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS: { view: AdminView; label: string; icon: React.ElementType }[] = [
  { view: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { view: "menu", label: "Menu", icon: UtensilsCrossed },
  { view: "specials", label: "Specials", icon: Star },
  { view: "hours", label: "Hours", icon: Clock },
  { view: "reservations", label: "Reservations", icon: CalendarCheck },
  { view: "images", label: "Images", icon: ImageIcon },
];

export default function AdminLayout({ activeView, onNavigate, onLogout, children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-neutral-800 bg-neutral-900 transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-neutral-800 px-4">
          <span className="text-lg font-bold tracking-wide text-amber-500">SEDO Admin</span>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map(({ view, label, icon: Icon }) => (
            <button
              key={view}
              onClick={() => {
                onNavigate(view);
                setSidebarOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                activeView === view
                  ? "bg-amber-600/20 text-amber-400"
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="border-t border-neutral-800 p-3">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center border-b border-neutral-800 px-4 lg:px-6">
          <button className="mr-3 lg:hidden" onClick={() => setSidebarOpen(true)}>
            <MenuIcon className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold capitalize">{activeView}</h1>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
