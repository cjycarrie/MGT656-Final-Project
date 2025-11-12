#!/usr/bin/env bash
# Build script for Render (to be used as the Build Command)
set -euo pipefail

echo "Installing Python dependencies..."
python -m pip install --upgrade pip
pip install -r backend/requirements.txt

echo "Running database migrations..."
# Ensure Django imports the right settings package when running from the repo root
# and regardless of any DJANGO_SETTINGS_MODULE value set in the environment.
DJANGO_SETTINGS_MODULE=logs.settings python backend/manage.py migrate --no-input

echo "Collecting static files..."
DJANGO_SETTINGS_MODULE=logs.settings python backend/manage.py collectstatic --no-input

echo "Creating test user..."
DJANGO_SETTINGS_MODULE=logs.settings python backend/manage.py create_test_user --username student_login --password student123

echo "Build script finished successfully."
