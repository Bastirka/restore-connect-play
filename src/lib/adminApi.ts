const API_BASE = "https://sedo-admin-auth.raivisbabris99.workers.dev";

export class AuthError extends Error {
  constructor(message: string) {
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

  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON response");
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

function normalizeArray(data: unknown): ApiMenuItem[] {
  if (!Array.isArray(data)) return [];

  return data.map((item: any, index) => ({
    id: String(item.id || `${Date.now()}-${index}`),
    category: item.category || "kebabi",
    groupName: item.groupName || "",
    variantName: item.variantName || "",
    description: item.description || "",
    price: String(item.price || ""),
    image: item.image || "",
    active: item.active === true || item.active === "true",
    sortOrder: Number(item.sortOrder || index + 1),
  }));
}

export const menuApi = {
  async list(): Promise<ApiMenuItem[]> {
    const data = await adminFetch<unknown>("/admin/menu");
    return normalizeArray(data);
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
      body: JSON.stringify([...items, newItem]),
    });
  },

  async update(id: string, patch: Partial<ApiMenuItem>) {
    const items = await this.list();

    const updated = items.map((i) => (i.id === id ? { ...i, ...patch } : i));

    return adminFetch("/admin/menu", {
      method: "POST",
      body: JSON.stringify(updated),
    });
  },

  async remove(id: string) {
    const items = await this.list();

    const filtered = items.filter((i) => i.id !== id);

    return adminFetch("/admin/menu", {
      method: "POST",
      body: JSON.stringify(filtered),
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

export const hoursApi = {
  async list(): Promise<ApiHours[]> {
    const data = await adminFetch<unknown>("/admin/hours");

    if (!Array.isArray(data)) return [];

    return data.map((h: any) => ({
      day: h.day,
      open: h.open || "",
      close: h.close || "",
      closed: h.closed === true || h.closed === "true",
    }));
  },

  async update(hours: ApiHours[]) {
    return adminFetch("/admin/hours", {
      method: "POST",
      body: JSON.stringify(hours),
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
  guests: number;
  zone: string;
  status: string;
  notes: string;
}

export const reservationsApi = {
  async list(): Promise<ApiReservation[]> {
    const data = await adminFetch<unknown>("/admin/reservations");

    if (!Array.isArray(data)) return [];

    return data;
  },
};
