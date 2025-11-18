from django.urls import path, include
from core import views as core_views

urlpatterns = [
    # API lives under /api/
    path('api/', include('core.urls')),
    # Serve frontend from project root; any path not matching /api/ will be
    # served from the `frontend/` directory by `serve_frontend`.
    path('', core_views.serve_frontend),
    path('<path:path>', core_views.serve_frontend),
]
