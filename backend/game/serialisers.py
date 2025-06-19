from users.serialisers import *
from rest_framework import serializers
from .models import *
        
class MoveSerialiser(serializers.ModelSerializer):
    class Meta:
        model = Move 
        fields = ['id',  'move_text', 'fen_after', 'created_at']
        
class GameSerialiser(serializers.ModelSerializer):
    white_player = ChessUserSerialiser(read_only=True, allow_null=True)
    black_player = ChessUserSerialiser(read_only=True, allow_null=True)
    moves = MoveSerialiser(many=True, read_only=True)
    
    class Meta:
        model = Game 
        fields = ['id', 'white_player', 'black_player', 'moves', 'current_fen',  'created_at']
        #fields = ['id', 'white_player', 'black_player',  'created_at']