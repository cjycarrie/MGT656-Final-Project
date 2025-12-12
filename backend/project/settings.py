import os
from pathlib import Path
from dotenv import load_dotenv
import dj_database_url

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
DEBUG = os.getenv('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'corsheaders',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.staticfiles',
    'core',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    # Request logging middleware logs each incoming request to stdout as JSON
    'core.middleware.request_logging.RequestLoggingMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'core.middleware.token_auth.TokenAuthMiddleware',
]

ROOT_URLCONF = 'project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            BASE_DIR / 'core' / 'templates',   
        ],
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


WSGI_APPLICATION = 'project.wsgi.application'

# Database
DATABASE_URL = os.getenv('DATABASE_URL')
if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.parse(DATABASE_URL)
    }
else:
    # Fallback to a local sqlite DB for development/testing when DATABASE_URL is not set
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Structured logging configuration: write request logs to console so Render collects them.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'simple': {'format': '%(levelname)s %(message)s'},
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'loggers': {
        # logger used by RequestLoggingMiddleware
        'request_logger': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        # keep Django's default logger printing to console as well
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}

# CORS - allow frontend to call API.
# For development we allow all origins; in production we only allow configured origins.
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://trackly-music.onrender.com",
]
# Allow all origins only in DEBUG for convenience
CORS_ALLOW_ALL_ORIGINS = DEBUG


# Session / Cookie settings
SESSION_COOKIE_AGE = 60 * 60 * 24 * 14  # 14 days
SESSION_EXPIRE_AT_BROWSER_CLOSE = False
# Secure cookie settings: in production we require Secure + SameSite=None for cross-site
if DEBUG:
    SESSION_COOKIE_SECURE = False
    SESSION_COOKIE_SAMESITE = 'Lax'
    CSRF_COOKIE_SECURE = False
    CSRF_COOKIE_SAMESITE = 'Lax'
else:
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_SAMESITE = 'None'
    CSRF_COOKIE_SECURE = True
    CSRF_COOKIE_SAMESITE = 'None'

# Allow credentials for cross-origin requests (frontend must use fetch credentials:'include')
CORS_ALLOW_CREDENTIALS = True
# Allow credentials (cookies) to be sent cross-origin
CORS_ALLOW_CREDENTIALS = True
# Allow credentials for cross-origin requests (frontend must use fetch credentials:'include')
CORS_ALLOW_CREDENTIALS = True

# Trusted origins for Django's CSRF when receiving cross-origin POSTs
# Must include the exact scheme + host of the frontend
CSRF_TRUSTED_ORIGINS = [
    "https://trackly-music.onrender.com",
]


