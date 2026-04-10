const API_BASE = "https://sedo-admin-auth.raivisbabris99.workers.dev";

export async function adminLogin(username: string, password: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/login`, {
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
    const res = await fetch(`${API_BASE}/admin/verify`, {
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
    await fetch(`${API_BASE}/admin/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // silent — cookie will expire anyway
  }
}
