from django.urls import path, include
from core.views import serve_frontend

urlpatterns = [
    path('api/', include('core.urls')),

    path('', serve_frontend),
    path('<path:path>', serve_frontend),
]
