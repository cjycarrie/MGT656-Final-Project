# MGT656-Final-Project — Minimal backend for Render

This repository contains a minimal Django backend under `backend/` intended for quick testing and deployment on Render.

What’s in `backend/` (enough to deploy to Render):

- `requirements.txt` — Python dependencies (Django, dj-database-url, python-dotenv, psycopg2)
- `Procfile` — `web: gunicorn project.wsgi --log-file -` (used by Render)
- `manage.py`, `project/`, `core/` — minimal Django project and app with `/` (OK) and `/login/` endpoints
- `README.md` inside `backend/` with usage notes (migrate, create_test_user)

Important notes for deployment to Render

1. In the Render service, set the **Root Directory** to `backend` (so Render installs requirements from `backend/requirements.txt`).
2. In Environment variables add:
   - `DATABASE_URL` — your remote Postgres URL (do NOT commit this to git)
   - optionally `SECRET_KEY`, `DEBUG=False`
3. Build command: leave empty or `pip install -r requirements.txt` if you set root.
4. Start command: Render will use the `Procfile` by default (`gunicorn project.wsgi`).
5. After deployment, run one-time commands in Render dashboard:
   - `python manage.py migrate`
   - `python manage.py create_test_user` (creates `student_login` / `123456`) or run the command to set password.

Security

- `.env` and sqlite DB files are ignored in `.gitignore`. Do not commit secrets into the repo.

If you want, I can add a tiny deploy script or CI step to run migrations automatically on deploy.
