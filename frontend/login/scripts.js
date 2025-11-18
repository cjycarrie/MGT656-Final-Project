const form = document.getElementById('signin-form');
const msgEl = document.getElementById('message');
const btn = document.getElementById('loginBtn');

const BASE = (typeof window !== 'undefined' && window.TRACKLY_API_BASE)
  ? window.TRACKLY_API_BASE
  : (typeof window !== 'undefined' ? window.location.origin + '/api' : 'https://trackly-3smc.onrender.com');

function getCookie(name) {
  const value = document.cookie.split('; ').find(row => row.startsWith(name + '='));
  return value ? decodeURIComponent(value.split('=')[1]) : null;
}

async function ensureCsrf() {
  // For cross-origin frontends we cannot read the backend cookie via
  // `document.cookie`. Call the backend JSON endpoint which returns the
  // token and also ensures the cookie is set.
  try {
    const res = await fetch(`${BASE}/csrf-token/`, { method: 'GET', credentials: 'include', mode: 'cors' });
    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (data && data.csrftoken) return data.csrftoken;
    }
  } catch (e) {
    // ignore network errors; caller will handle errors
  }
  return null;
}

function showMessage(text) {
  if (msgEl) msgEl.textContent = text || '';
}

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showMessage('');
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
      showMessage('Please fill in all fields.');
      return;
    }

    try {
      btn.disabled = true;
      btn.textContent = 'Signing in...';

      // Prefer session-based login when on same-origin. Use CSRF helper then
      // POST to /login/ with credentials included.
      const csrf = await ensureCsrf();
      let response = await fetch(`${BASE}/login/`, {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrf || '',
          'Referer': window.location.origin,
        },
        body: JSON.stringify({ username, password }),
      });

      // If session login fails, fall back to token login for compatibility.
      if (!response.ok && (response.status === 404 || response.status === 405 || response.status === 401)) {
        response = await fetch(`${BASE}/token/`, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json', 'Referer': window.location.origin },
          body: JSON.stringify({ username, password }),
        });
      }

      if (!response.ok) {
        const text = await response.text().catch(() => null);
        showMessage('Invalid username or password');
        btn.disabled = false;
        btn.textContent = 'Sign in';
        return;
      }
      const data = await response.json().catch(() => null);
      // If token-based login returned a token, save it
      if (data && data.token) {
        // token-based login
        localStorage.setItem('trackly_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user || {}));
      } else {
        // session-based login: store user info if provided
        localStorage.setItem('user', JSON.stringify(data || {}));
      }
      window.location.href = '../profile/index.html';
    } catch (err) {
      console.error(err);
      showMessage('Network error. Please try again.');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Sign in'; }
    }
  });
}
