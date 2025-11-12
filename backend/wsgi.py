import os
from django.core.wsgi import get_wsgi_application

# 指向 settings.py
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.logs.settings')

application = get_wsgi_application()