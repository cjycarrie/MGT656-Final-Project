import { useState } from "react";

export default function LoginPage() {
  const API =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
    process.env.REACT_APP_API_URL ||
    "";

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
      if (!API) throw new Error("Missing API base URL (VITE_API_URL).");

      const tokenRes = await fetch(`${API}/api/auth/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!tokenRes.ok) {
        const msg = tokenRes.status === 401 ? "Invalid username or password." : "Login failed.";
        throw new Error(msg);
      }

      const { access, refresh } = await tokenRes.json();
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      const meRes = await fetch(`${API}/api/auth/me/`, {
        headers: { Authorization: `Bearer ${access}` },
      });

      if (!meRes.ok) throw new Error("Authenticated request failed.");
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
            background: "#111827",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: loading ? "not-allowed" : "pointer",
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
          <div style={{ fontSize: 14, color: "#374151" }}>{me.email}</div>
        </div>
      )}

      <p style={{ marginTop: 16, fontSize: 12, color: "#6b7280" }}>
        API: {API || "(not set — add VITE_API_URL in .env)"}
      </p>
    </div>
  );
}
