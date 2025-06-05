from django.urls import path
from .views import *
urlpatterns = [
    path('get-game/', GameView.as_view(), name='GameView'),
]