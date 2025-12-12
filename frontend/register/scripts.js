const form = document.getElementById('register-form');
const msgEl = document.getElementById('message');
const btn = document.getElementById('registerBtn');

const BASE = (typeof window !== 'undefined' && window.TRACKLY_API_BASE)
  ? window.TRACKLY_API_BASE
  : (typeof window !== 'undefined' ? window.location.origin + '/api' : 'https://trackly-3smc.onrender.com');

function getCookie(name) {
  const value = document.cookie.split('; ').find(row => row.startsWith(name + '='));
  return value ? decodeURIComponent(value.split('=')[1]) : null;
}

async function ensureCsrf() {
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
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const passwordConfirm = document.getElementById('password-confirm').value.trim();

    if (!username || !email || !password || !passwordConfirm) {
      showMessage('Please fill in all fields.');
      return;
    }

    if (password !== passwordConfirm) {
      showMessage('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      showMessage('Password must be at least 6 characters long.');
      return;
    }

    try {
      btn.disabled = true;
      btn.textContent = 'Creating account...';

      const csrf = await ensureCsrf();
      const response = await fetch(`${BASE}/register/`, {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrf || '',
          'Referer': window.location.origin,
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errorMsg = data.detail || data.error || 'Registration failed. Please try again.';
        showMessage(errorMsg);
        btn.disabled = false;
        btn.textContent = 'Sign up';
        return;
      }

      const data = await response.json().catch(() => null);
      
      // Registration successful, redirect to login
      showMessage('Account created! Redirecting to sign in...');
      setTimeout(() => {
        window.location.href = '../login/index.html';
      }, 1500);
    } catch (err) {
      console.error(err);
      showMessage('Network error. Please try again.');
      btn.disabled = false;
      btn.textContent = 'Sign up';
    }
  });
}
