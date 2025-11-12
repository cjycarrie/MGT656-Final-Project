from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import PostListCreateAPIView

urlpatterns = [
    # 你的 posts 路由
    path('posts/', PostListCreateAPIView.as_view(), name='api-posts'),
]