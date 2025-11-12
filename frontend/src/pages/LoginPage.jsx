async function handleLogin(e) {
  e.preventDefault();
  setError("");
  setLoading(true);
  setMe(null);

  try {
    const API = import.meta.env.VITE_API_URL; // should be https://trackly-3smc.onrender.com
    if (!API) throw new Error("Missing VITE_API_URL");

    const res = await fetch(`${API}/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), password: password.trim() }),
    });

    const raw = await res.text();
    let data = null;
    try { data = raw ? JSON.parse(raw) : null; } catch {}

    console.log("LOGIN status:", res.status, "body:", data ?? raw);

    if (!res.ok) {
      const msg = (data && (data.detail || data.message || data.error || data.status)) || raw || "Login failed.";
      throw new Error(msg);
    }

    // backend returns {"status":"OK"} -> treat as success
    setMe({ username: username.trim() });
    setError("");
  } catch (err) {
    setError(err.message || "Something went wrong.");
  } finally {
    setLoading(false);
  }
}

