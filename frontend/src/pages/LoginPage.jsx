import { useState } from "react";

/**
 * Trackly Login Page
 * Uses: import.meta.env.VITE_API_URL (e.g. https://trackly-3smc.onrender.com)
 * Calls: POST /login/  -> expects {"status":"OK"} on success
 */
export default function LoginPage() {
  const API = import.meta.env.VITE_API_URL || "";

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
      if (!API) throw new Error("Missing VITE_API_URL");

      const res = await fetch(`${API}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const raw = await res.text();
      let data = null;
      try { data = raw ? JSON.parse(raw) : null; } catch {}

      console.log("LOGIN status:", res.status, "body:", data ?? raw);

      if (!res.ok) {
        const msg =
          (data && (data.detail || data.message || data.error || data.status)) ||
          raw ||
          "Login failed.";
        throw new Error(msg);
      }

      // Backend returns {"status":"OK"} → treat as success
      setMe({ username: username.trim() });
      setError("");
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
          <strong>Welcome, {me.username}</strong>
        </div>
      )}

      <p style={{ marginTop: 16, fontSize: 12, color: "#6b7280" }}>
        API: {API || "(not set — add VITE_API_URL)"}
      </p>
    </div>
  );
}


