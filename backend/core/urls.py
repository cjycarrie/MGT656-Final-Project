from django.urls import path
from . import views

urlpatterns = [
    path('', views.ok),
    path('login/', views.login_view),
    path('csrf/', views.csrf),
    path('csrf-token/', views.csrf_token),
]
