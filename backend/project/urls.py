from django.urls import path, include
from core.views import analytics_view, serve_frontend

urlpatterns = [

    # A/B Test endpoint
    path('525b6d8/', analytics_view),

    # API routes
    path('api/', include('core.urls')),

    # Frontend fallback (MUST be last!)
    path('', serve_frontend),
    path('<path:path>', serve_frontend),
]
