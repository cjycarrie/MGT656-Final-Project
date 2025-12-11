from django.urls import path, include
from core import views as core_views
from core.views import analytics_view  

urlpatterns = [
    path('525b6d8/', analytics_view),

    # API lives under /api/
    path('api/', include('core.urls')),

    # Serve frontend from project root
    path('', core_views.serve_frontend),
    path('<path:path>', core_views.serve_frontend),
]
