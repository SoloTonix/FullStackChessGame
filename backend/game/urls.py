from django.urls import path
from .views import *
urlpatterns = [
    path('get-game/', GameView.as_view(), name='GameView'),
    path('get-game/<int:pk>/', GetGameView.as_view(), name='GetGameView'),
    path('get-game-moves/<int:pk>/', GetGameMovesView.as_view(), name='GetGameMovesView'),
]