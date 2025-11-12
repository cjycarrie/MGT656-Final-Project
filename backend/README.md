# Minimal Django backend

This is a minimal Django project intended for quick deployment on Render. It reads `DATABASE_URL` from the environment using `dj-database-url` (and `python-dotenv` for local testing).

Quick notes:

- Set the environment variable `DATABASE_URL` (on Render, add it in the service's Environment section).
- Run migrations: `python manage.py migrate`
- Create the test user: `python manage.py create_test_user` (creates `student_login` / `123456`).
- The root path `/` returns plain text `OK`.
- Login endpoint: POST `/login/` with JSON `{ "username": "student_login", "password": "123456" }` returns `{ "status": "OK" }` on success.

CORS / frontend notes
- This backend now includes `django-cors-headers` and allows cross-origin requests for quick testing. That lets a frontend served from a different origin call `/login/` directly.
- Example fetch from frontend:

```javascript
fetch('https://trackly-3smc.onrender.com/login/', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ username: 'student_login', password: '123456' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

# Backend (placeholder)\n\nThis is a minimal backend folder created on Wed Nov 12 05:21:05 UTC 2025.
