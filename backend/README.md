# Backend usage (subset)

This copy is placed inside the `backend/` folder for hosting/deployment convenience.

Start server (development):

```bash
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Production (Render) expects a `Procfile` in the project root; a copy of the Procfile is also placed here.

Available endpoints:
- POST /api/token/ or /api/login/ (get JWT)
- POST /api/token/refresh/ (refresh token)
- GET/POST /api/posts/
- GET /health/
