from django.urls import path
from . import views

urlpatterns = [
    # 登录接口
    path('login/', views.login_view, name='login'),
    
    # 注册接口（可选）
    path('register/', views.register_view, name='register'),
]