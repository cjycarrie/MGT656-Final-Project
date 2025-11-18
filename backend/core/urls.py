from django.urls import path
from . import views

urlpatterns = [
    path('', views.ok),
    path('login/', views.login_view),
    path('csrf/', views.csrf),
    path('csrf-token/', views.csrf_token),
    path('token/', views.token_login),
    path('posts/friends/', views.friends_posts),
    path('posts/', views.create_post),
    path('posts/<int:post_id>/like/', views.like_post),
    path('debug/token-check/', views.token_debug),
]
