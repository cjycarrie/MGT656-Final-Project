const form = document.getElementById('signin-form');
const msgEl = document.getElementById('message');
const btn = document.getElementById('loginBtn');

const BASE = 'https://trackly-3smc.onrender.com';

function getCookie(name) {
  const value = document.cookie.split('; ').find(row => row.startsWith(name + '='));
  return value ? decodeURIComponent(value.split('=')[1]) : null;
}

async function ensureCsrf() {
  // Call the backend CSRF endpoint to set the csrftoken cookie (if not already set).
  try {
    await fetch(`${BASE}/csrf/`, { method: 'GET', credentials: 'include', mode: 'cors' });
  } catch (e) {
    // ignore network errors here; login will fail later with a network/CSRF error
  }
  return getCookie('csrftoken');
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

      // Ensure CSRF cookie is set and include credentials so cookies are sent back and forth
      const csrf = await ensureCsrf();

      const response = await fetch(`${BASE}/login/`, {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrf || '',
          'Referer': window.location.origin
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => null);
        showMessage('Invalid username or password');
        btn.disabled = false;
        btn.textContent = 'Sign in';
        return;
      }

      const data = await response.json().catch(() => null);
      localStorage.setItem('user', JSON.stringify(data || {}));
      window.location.href = '../profile/index.html';
    } catch (err) {
      console.error(err);
      showMessage('Network error. Please try again.');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Sign in'; }
    }
  });
}
