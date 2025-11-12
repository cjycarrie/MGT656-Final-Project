const API = import.meta.env.VITE_API_URL; // should be https://trackly-3smc.onrender.com
await fetch(`${API}/login/`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username, password }),
});




