const form = document.getElementById('signin-form');
const msgEl = document.getElementById('message');
const btn = document.getElementById('loginBtn');

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

      const response = await fetch('https://trackly-3smc.onrender.com/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
