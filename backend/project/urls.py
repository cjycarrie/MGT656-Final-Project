from django.urls import path, include
from core.views import analytics_view, serve_frontend

urlpatterns = [
    path('525b6d8/', analytics_view),

    path('api/', include('core.urls')),

    path('', serve_frontend),
    path('<path:path>', serve_frontend),
]
