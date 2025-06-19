from django.db import models
from django.contrib.auth.models import User
from users.models import *
from django.conf import settings
# Create your models here.
class Game(models.Model):
    white = 'w'
    black = 'b'
    color_choices = [(white, 'White'), (black, 'Black')]
    
    white_player = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='white_games')
    black_player = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='black_games')
    current_fen = models.CharField(max_length=100, default='rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')  # Starting position
    winner = models.CharField(choices=color_choices, max_length=1, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
class Move(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='moves')
    move_text = models.CharField(max_length=10)  # e.g., "e2e4"
    fen_after = models.CharField(max_length=100)  # Board state after move
    created_at = models.DateTimeField(auto_now_add=True)