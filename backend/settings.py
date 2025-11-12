"""
Django settings for trackly_backend project.
Cleaned and organized for development in Codespaces and deployment on Render.
"""

from pathlib import Path
import os
from datetime import timedelta
from dotenv import load_dotenv
import dj_database_url

# Load environment variables
load_dotenv()

# ------------------------------------------------------------
# BASE DIR
# ------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# ------------------------------------------------------------
# SECURITY
# ------------------------------------------------------------
SECRET_KEY = os.getenv("SECRET_KEY", "django-insecure-dev-key")
DEBUG = os.getenv("DEBUG", "True") == "True"
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "*").split(",")

# ------------------------------------------------------------
# APPLICATIONS
# ------------------------------------------------------------
INSTALLED_APPS = [
    # Django core
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Your apps
    'users',
    'posts',

    # Third-party
    'rest_framework',
    'corsheaders',
]

# ------------------------------------------------------------
# MIDDLEWARE
# ------------------------------------------------------------
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',   # Must come first
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = "trackly_backend.urls"

# ------------------------------------------------------------
# TEMPLATES
# ------------------------------------------------------------
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = "trackly_backend.wsgi.application"

# ------------------------------------------------------------
# DATABASE
# ------------------------------------------------------------
DATABASES = {
    'default': dj_database_url.parse(
        os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'db.sqlite3'}")
    )
}

# ------------------------------------------------------------
# PASSWORD VALIDATION
# ------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ------------------------------------------------------------
# INTERNATIONALIZATION
# ------------------------------------------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'America/New_York'
USE_I18N = True
USE_TZ = True

# ------------------------------------------------------------
# STATIC & MEDIA FILES
# ------------------------------------------------------------
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# ------------------------------------------------------------
# REST FRAMEWORK & AUTH
# ------------------------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}

# ------------------------------------------------------------
# CORS SETTINGS
# ------------------------------------------------------------
FRONTEND_ORIGIN = os.getenv('FRONTEND_ORIGIN')

if FRONTEND_ORIGIN:
    CORS_ALLOWED_ORIGINS = [FRONTEND_ORIGIN]
    CORS_ALLOW_ALL_ORIGINS = False
else:
    CORS_ALLOW_ALL_ORIGINS = True

# ------------------------------------------------------------
# DEFAULT PRIMARY KEY FIELD
# ------------------------------------------------------------
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

