from django.urls import path
from . import views

urlpatterns = [
    path('', views.ok),
    path('login/', views.login_view),
    # API aliases for frontend dev proxy paths
    path('api/login/', views.login_view),
    path('api/auth/token/', views.login_view),
]
