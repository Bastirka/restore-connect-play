const API_BASE = "https://sedo-admin-auth.raivisbabris99.workers.dev";

export class AuthError extends Error {
  constructor(message = "Session expired") {
    super(message);
    this.name = "AuthError";
  }
}

async function adminFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (res.status === 401 || res.status === 403) {
    throw new AuthError();
  }

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`API ${res.status}: ${text}`);
  }

  try {
    return text ? JSON.parse(text) : (null as T);
  } catch {
    throw new Error("Invalid JSON from server");
  }
}

// ───────── MENU ─────────

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

function normalizeMenu(data: unknown): ApiMenuItem[] {
  if (!Array.isArray(data)) return [];

  return data.map((item: any, index) => ({
    id: String(item.id ?? `${Date.now()}-${index}`),
    category: String(item.category ?? "kebabi"),
    groupName: String(item.groupName ?? ""),
    variantName: String(item.variantName ?? ""),
    description: String(item.description ?? ""),
    price: String(item.price ?? ""),
    image: String(item.image ?? ""),
    active: item.active === true || item.active === "true",
    sortOrder: Number(item.sortOrder ?? index + 1),
  }));
}

function normalizeMenuForSave(items: ApiMenuItem[]): ApiMenuItem[] {
  return items.map((i, index) => ({
    id: String(i.id),
    category: String(i.category),
    groupName: String(i.groupName),
    variantName: String(i.variantName || ""),
    description: String(i.description || ""),
    price: String(i.price),
    image: String(i.image || ""),
    active: !!i.active,
    sortOrder: Number(i.sortOrder ?? index + 1),
  }));
}

export const menuApi = {
  async list(): Promise<ApiMenuItem[]> {
    const data = await adminFetch<unknown>("/admin/menu");
    return normalizeMenu(data);
  },

  async create(item: Omit<ApiMenuItem, "id">) {
    const items = await this.list();

    const newItem: ApiMenuItem = {
      ...item,
      id: Date.now().toString(),
      sortOrder: items.length + 1,
      active: !!item.active,
    };

    return adminFetch("/admin/menu", {
      method: "POST",
      body: JSON.stringify(normalizeMenuForSave([...items, newItem])),
    });
  },

  async update(id: string, patch: Partial<ApiMenuItem>) {
    const items = await this.list();

    const updated = items.map((i) => (i.id === id ? { ...i, ...patch } : i));

    return adminFetch("/admin/menu", {
      method: "POST",
      body: JSON.stringify(normalizeMenuForSave(updated)),
    });
  },

  async remove(id: string) {
    const items = await this.list();

    const filtered = items.filter((i) => i.id !== id);

    return adminFetch("/admin/menu", {
      method: "POST",
      body: JSON.stringify(normalizeMenuForSave(filtered)),
    });
  },
};

// ───────── HOURS ─────────

export interface ApiHours {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

function normalizeHours(data: unknown): ApiHours[] {
  if (!Array.isArray(data)) return [];

  return data.map((h: any) => ({
    day: String(h.day ?? ""),
    open: String(h.open ?? ""),
    close: String(h.close ?? ""),
    closed: h.closed === true || h.closed === "true",
  }));
}

export const hoursApi = {
  async list(): Promise<ApiHours[]> {
    const data = await adminFetch<unknown>("/admin/hours");
    return normalizeHours(data);
  },

  async update(hours: ApiHours[]) {
    const clean = hours.map((h) => ({
      day: h.day,
      open: h.open,
      close: h.close,
      closed: !!h.closed,
    }));

    return adminFetch("/admin/hours", {
      method: "POST",
      body: JSON.stringify(clean),
    });
  },
};

// ───────── RESERVATIONS ─────────

export interface ApiReservation {
  reservationId: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  endTime: string;
  guests: number;
  zone: string;
  status: string;
  notes: string;
}

function normalizeReservations(data: unknown): ApiReservation[] {
  if (!Array.isArray(data)) return [];

  return data.map((r: any) => ({
    reservationId: String(r.reservationId || r.id || ""),
    name: String(r.name || ""),
    phone: String(r.phone || ""),
    date: String(r.date || ""),
    time: String(r.time || ""),
    endTime: String(r.endTime || r.end_time || ""),
    guests: Number(r.guests || 0),
    zone: String(r.zone || ""),
    status: String(r.status || "active"),
    notes: String(r.notes || ""),
  }));
}

export const reservationsApi = {
  async list(): Promise<ApiReservation[]> {
    const data = await adminFetch<unknown>("/admin/reservations");
    return normalizeReservations(data);
  },
};
