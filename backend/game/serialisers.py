from users.serialisers import UserSerialiser
from rest_framework import serializers
from .models import *
        
class MoveSerialiser(serializers.ModelSerializer):
    class Meta:
        model = Move 
        fields = ['id', 'game', 'move_text', 'fen_after', 'created_at']
        
class GameSerialiser(serializers.ModelSerializer):
    white_player = UserSerialiser(read_only=True)
    black_player = UserSerialiser(read_only=True)
    moves = MoveSerialiser(many=True, read_only=True)
    class Meta:
        model = Game 
        fields = ['id', 'white_player', 'black_player', 'current_fen', 'moves', 'created_at']