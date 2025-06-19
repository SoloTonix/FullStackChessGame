from django.urls import path
from .views import *
from rest_framework_simplejwt import views
urlpatterns = [
    path('register/', RegisterView.as_view(), name='RegisterView'),
    path('token/', views.TokenObtainPairView.as_view(), name='TokenObtainPairView'),
    path('token/refresh/', views.TokenRefreshView.as_view(), name='TokenRefreshView'),
]