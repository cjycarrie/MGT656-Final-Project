import { useState } from "react";

/**
 * Trackly Login Page (frontend-only)
 * DEV uses Vite proxy:
 *   Frontend calls:  /api/login/   and  /api/me/
 *   Vite forwards to: https://trackly-3smc.onrender.com
 */
export default function LoginPage() {
  // Display string for the footer so users know we're proxying in dev
  const API_DISPLAY = "Vite proxy → https://trackly-3smc.onrender.com";

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
      // 1️⃣ Call your backend directly
      const loginRes = await fetch("https://trackly-3smc.onrender.com/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      // 2️⃣ Check if login was successful
      if (!loginRes.ok) {
        let msg = "Login failed.";
        try {
          const j = await loginRes.json();
          msg = j.detail || j.message || msg;
        } catch (_) {}
        throw new Error(msg);
      }

      // 3️⃣ Try to read JSON response (if any)
      let loginJson = null;
      try {
        loginJson = await loginRes.json();
      } catch (_) {}

      console.log("Login response:", loginJson);

      // 4️⃣ Optionally store tokens (if backend returns any)
      const access =
        loginJson?.access || loginJson?.token || loginJson?.access_token;
      const refresh =
        loginJson?.refresh || loginJson?.refresh_token;
      if (access) localStorage.setItem("access", access);
      if (refresh) localStorage.setItem("refresh", refresh);

      // 5️⃣ (Optional) Fetch current user if backend has a /me/ route
      // comment this out if your backend doesn't have a /me/ endpoint yet
      const meRes = await fetch("https://trackly-3smc.onrender.com/me/", {
        headers: access ? { Authorization: `Bearer ${access}` } : undefined,
      });

      if (meRes.ok) {
        const meJson = await meRes.json();
        setMe(meJson);
      } else {
        console.warn("No /me/ endpoint or user not returned.");
      }

    } catch (err) {
      console.error(err);
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
        API: {API_DISPLAY}
      </p>
    </div>
  );
}

