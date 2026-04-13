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

// ───────── SPECIALS ─────────

export interface AdminSpecial {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  active: boolean;
  startDate: string;
  endDate: string;
  sortOrder: number;
}

// ───────── HOURS ─────────

export interface AdminHours {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

// ───────── RESERVATIONS ─────────

export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "completed" | "active";

export interface AdminReservation {
  id: string;
  name: string;
  phone: string;
  email?: string;
  date: string;
  time: string;
  endTime?: string;
  guests: number;
  zone: string;
  status: ReservationStatus;
  notes?: string;
  tableIds?: string[];
}

// ───────── IMAGES ─────────

export interface AdminImage {
  id: string;
  url: string;
  name: string;
  assignedTo: string;
  uploadedAt: string;
}

// ───────── HELPERS ─────────

export interface ApiListResponse<T> {
  items?: T[];
  data?: T[];
}

export type ID = string;
export type Nullable<T> = T | null;
export type Optional<T> = {
  [K in keyof T]?: T[K];
};
