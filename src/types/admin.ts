// ───────── MENU ─────────

export interface AdminMenuItem {
  id: string;
  category: string;
  groupName: string;
  variantName: string;
  description: string;
  price: string;
  image: string;
  active: boolean;
  sortOrder: number;
}

// ───────── SPECIALS (hero / plakāti) ─────────

export interface AdminSpecial {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  active: boolean;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  sortOrder: number;
}

// ───────── HOURS (SVARĪGI: open/close, nevis openTime) ─────────

export interface AdminHours {
  day: string; // mon, tue, wed...
  open: string; // "10:00"
  close: string; // "22:00"
  closed: boolean;
}

// ───────── RESERVATIONS ─────────

export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "completed" | "active"; // worker izmanto "active"

export interface AdminReservation {
  id: string;
  name: string; // ⚠️ NEVIS customerName
  phone: string;
  email?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  guests: number;
  zone: string;
  status: ReservationStatus;
  notes?: string;
  tableIds?: string[]; // no worker
}

// ───────── IMAGES ─────────

export interface AdminImage {
  id: string;
  url: string;
  name: string;
  assignedTo: string;
  uploadedAt: string;
}

// ───────── API RESPONSE WRAPPERS (drošībai) ─────────

export interface ApiListResponse<T> {
  items?: T[];
  data?: T[];
}

// ───────── HELPER TYPES ─────────

export type ID = string;

export type Nullable<T> = T | null;

export type Optional<T> = {
  [K in keyof T]?: T[K];
};
