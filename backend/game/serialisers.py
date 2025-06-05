from users.serialisers import UserSerialiser
from rest_framework import serializers
from .models import *
        
class MoveSerialiser(serializers.ModelSerializer):
    class Meta:
        model = Move 
        fields = ['id', 'game', 'move_text', 'fen_after', 'created_at']
        
class GameSerialiser(serializers.ModelSerializer):
    white_player = UserSerialiser()
    black_player = UserSerialiser()
    moves = MoveSerialiser(many=True)
    class Meta:
        model = Game 
        fields = ['id', 'white_player', 'black_player', 'current_fen', 'moves', 'created_at']