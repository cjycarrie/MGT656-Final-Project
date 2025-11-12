import { useState } from "react";

/**
 * Trackly Login Page (frontend-only)
 * Backend base URL: import.meta.env.VITE_API_URL (e.g. https://trackly-3smc.onrender.com)
 *
 * Login:  POST  /login/   -> returns JSON (may set session cookie)
 * Me:     GET   /me/      -> returns { id, username, email }   (adjust if your backend uses a different path)
 */
export default function LoginPage() {
  const API =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) || "";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [me, setMe] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setMe(null);

    try {
      if (!API) throw new Error("Missing VITE_API_URL.");

      // 1) Login — backend said POST /login/
      const tokenRes = await fetch(`${API}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // include credentials in case backend uses session cookies
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (!tokenRes.ok) {
        // Try to read server's error message if any
        let msg = "Login failed.";
        try {
          const j = await tokenRes.json();
          msg = j.detail || j.message || msg;
        } catch (_) {}
        throw new Error(msg);
      }

      // Try to parse JSON (could contain tokens or just a message)
      let loginJson = null;
      try {
        loginJson = await tokenRes.json();
      } catch (_) {
        // no JSON body is also fine if we're using session cookies
      }

      // If tokens were returned, stash them (optional; harmless if absent)
      const access = loginJson?.access || loginJson?.token || loginJson?.access_token;
      const refresh = loginJson?.refresh || loginJson?.refresh_token;
      if (access) localStorage.setItem("access", access);
      if (refresh) localStorage.setItem("refresh", refresh);

      // 2) Fetch current user — common path is /me/ when using sessions.
      // If your backend exposes a different path, update it here.
      let meRes = await fetch(`${API}/me/`, {
        credentials: "include",
        headers: access ? { Authorization: `Bearer ${access}` } : undefined,
      });

      // Fallback to the old path if /me/ doesn't exist
      if (!meRes.ok && meRes.status === 404) {
        meRes = await fetch(`${API}/api/auth/me/`, {
          credentials: "include",
          headers: access ? { Authorization: `Bearer ${access}` } : undefined,
        });
      }

      if (!meRes.ok) {
        // Not fatal for demo; still show login response if any
        throw new Error("Authenticated request failed (check /me/ path or CORS).");
      }

      const meJson = await meRes.json();
      setMe(meJson);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: "48px auto", fontFamily: "system-ui" }}>
      <h2 style={{ marginBottom: 16 }}>Trackly Login</h2>

      <form onSubmit={handleLogin}>
        <label style={{ display: "block", marginBottom: 6 }}>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 12 }}
          placeholder="yourusername"
          required
        />

        <label style={{ display: "block", marginBottom: 6 }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 16 }}
          placeholder="••••••••"
          required
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            cursor: loading ? "not-allowed" : "pointer",
            background: "#111827",
            color: "#fff",
            border: "none",
            borderRadius: 8,
          }}
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      {error && <p style={{ color: "crimson", marginTop: 12 }}>{error}</p>}

      {me && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            background: "#f9fafb",
          }}
        >
          <strong>Welcome, {me.username || me.email || "user"}</strong>
          <div style={{ fontSize: 14, color: "#374151" }}>
            {me.email || me.username || ""}
          </div>
        </div>
      )}

      <p style={{ marginTop: 16, fontSize: 12, color: "#6b7280" }}>
        API: {API || "(not set — add VITE_API_URL in .env.local)"}
      </p>
    </div>
  );
}
