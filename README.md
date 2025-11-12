# MGT656-Final-Project — Backend

This repository contains the Django backend used for the MGT656 final project.

## Quick start (development)

1. Create and activate a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

2. Apply migrations:

```bash
python backend/manage.py migrate
```

3. Run the development server (bind to all interfaces so Codespaces can forward the port):

```bash
python backend/manage.py runserver 0.0.0.0:8000
```

4. If you're using Codespaces: open the Ports panel and make port `8000` public.

## Available API endpoints

Authentication:
- POST /api/token/  — obtain access & refresh tokens (JSON body: {"username":"...","password":"..."})
- POST /api/login/  — alias for /api/token/
- POST /api/token/refresh/ — refresh access token (JSON body: {"refresh":"..."})

Posts:
- GET /api/posts/  — list posts
- POST /api/posts/ — create post (requires Authorization header)

Health:
- GET /health/  — returns {"status": "ok"}

## Example requests

Get tokens (curl):

```bash
curl -X POST http://127.0.0.1:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"student_login","password":"student123"}'
```

Create a post using access token:

```bash
curl -X POST http://127.0.0.1:8000/api/posts/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"title":"Test","content":"Hello"}'
```

## Notes
- During development the app may allow all CORS origins. For production set `FRONTEND_ORIGIN` and set `DEBUG=False`.
- Test user created for development: `student_login` / `student123`. Remove or replace in staging/production.
