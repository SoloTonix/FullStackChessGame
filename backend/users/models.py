from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.
class ChessUser(AbstractUser):
    elo_rating = models.IntegerField(default=900)
    games_played = models.IntegerField(default=0)
    
    def update_rating(self, opponent_rating, result):
        K = 32
        expected = 1 / (1 + 10 ** ((opponent_rating - self.elo_rating) / 400))
        self.elo_rating += K * (result - expected)
        self.games_played += 1
        self.save()