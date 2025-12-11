from django.urls import path, include
from core import views as core_views
from core.views import analytics_view

urlpatterns = [
    # move analytics into /api/ to avoid being overridden by serve_frontend
    path('api/525b6d8/', analytics_view),

    # API lives under /api/
    path('api/', include('core.urls')),

    # Serve frontend (fallback)
    path('', core_views.serve_frontend),
    path('<path:path>', core_views.serve_frontend),
]
