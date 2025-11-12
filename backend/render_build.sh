#!/usr/bin/env bash
# Build script for Render (to be used as the Build Command)
set -euo pipefail

echo "Installing Python dependencies..."
python -m pip install --upgrade pip
pip install -r backend/requirements.txt

echo "Running database migrations..."
python backend/manage.py migrate --no-input

echo "Collecting static files..."
python backend/manage.py collectstatic --no-input

echo "Creating test user..."
python backend/manage.py create_test_user --username student_login --password student123

echo "Build script finished successfully."
