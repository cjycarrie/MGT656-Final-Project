from django.urls import path
from . import views

urlpatterns = [
    path('', views.ok),
    path('login/', views.login_view),
    path('csrf/', views.csrf),
    path('posts/friends/', views.friends_posts),
    path('posts/', views.create_post),
    path('posts/<int:post_id>/like/', views.like_post),
]
