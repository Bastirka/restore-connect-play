const API_BASE = "https://sedo-admin-auth.raivisbabris99.workers.dev".replace(/\/+$/, "");

const AUTH_ENDPOINTS = {
  login: `${API_BASE}/admin/login`,
  verify: `${API_BASE}/admin/verify`,
  logout: `${API_BASE}/admin/logout`,
} as const;

export async function adminLogin(username: string, password: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(AUTH_ENDPOINTS.login, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) return { ok: true };
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: data.error || "Invalid credentials" };
  } catch {
    return { ok: false, error: "Network error — unable to reach auth server" };
  }
}

export async function adminVerify(): Promise<boolean> {
  try {
    const res = await fetch(AUTH_ENDPOINTS.verify, {
      method: "GET",
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function adminLogout(): Promise<void> {
  try {
    await fetch(AUTH_ENDPOINTS.logout, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // silent — cookie will expire anyway
  }
}
