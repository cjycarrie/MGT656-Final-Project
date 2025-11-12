from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from logs.posts.views import PostListCreateAPIView

urlpatterns = [
    path('admin/', admin.site.urls),
    # Token endpoints (alias login for compatibility)
    path('api/login/', TokenObtainPairView.as_view(), name='token_login'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Posts API (merged here for a single routing table)
    path('api/posts/', PostListCreateAPIView.as_view(), name='api-posts'),
]