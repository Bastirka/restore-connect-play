const API_BASE = "https://sedo-admin-auth.raivisbabris99.workers.dev";

async function adminFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (res.status === 401 || res.status === 403) {
    throw new AuthError("Session expired");
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

// ── Menu ──

export interface ApiMenuItem {
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

function unwrapArray<T>(data: unknown, ...keys: string[]): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    for (const key of keys) {
      if (Array.isArray((data as Record<string, unknown>)[key])) {
        return (data as Record<string, unknown>)[key] as T[];
      }
    }
  }
  return [];
}

export const menuApi = {
  list: async () => unwrapArray<ApiMenuItem>(await adminFetch<unknown>("/admin/menu"), "items", "menu", "data"),
  create: (item: Omit<ApiMenuItem, "id">) =>
    adminFetch<ApiMenuItem>("/admin/menu", { method: "POST", body: JSON.stringify(item) }),
  update: (id: string, item: Partial<ApiMenuItem>) =>
    adminFetch<ApiMenuItem>(`/admin/menu/${id}`, { method: "PUT", body: JSON.stringify(item) }),
  remove: (id: string) =>
    adminFetch<void>(`/admin/menu/${id}`, { method: "DELETE" }),
};

// ── Hours ──

export interface ApiHours {
  day: string;
  openTime: string;
  closeTime: string;
  closed: boolean;
}

export const hoursApi = {
  list: () => adminFetch<ApiHours[]>("/admin/hours"),
  update: (hours: ApiHours[]) =>
    adminFetch<ApiHours[]>("/admin/hours", { method: "POST", body: JSON.stringify(hours) }),
};

// ── Reservations ──

export interface ApiReservation {
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

export const reservationsApi = {
  list: () => adminFetch<ApiReservation[]>("/admin/reservations"),
  updateStatus: (id: string, status: ApiReservation["status"]) =>
    adminFetch<ApiReservation>(`/admin/reservations/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
};
