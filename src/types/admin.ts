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

export interface AdminHours {
  day: string;
  openTime: string;
  closeTime: string;
  closed: boolean;
}

export interface AdminReservation {
  id: string;
  customerName: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  zone: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes: string;
}

export interface AdminImage {
  id: string;
  url: string;
  name: string;
  assignedTo: string;
  uploadedAt: string;
}
