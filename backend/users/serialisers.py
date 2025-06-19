from rest_framework import serializers
from django.contrib.auth.models import User
from .models import *
class UserSerialiser(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        extra_kwargs = {'password':{'write_only':True}, 'id':{'read_only':True}}
        
    def create(self, validated_data):
        User.objects.create_user(**validated_data)
        
        
class ChessUserSerialiser(serializers.ModelSerializer):
    class Meta:
        model = ChessUser
        fields = ['id', 'username','password', 'elo_rating', 'games_played']
        extra_kwargs = {'password':{'write_only':True}, 'id':{'read_only':True}}
    
    def create(self, validated_data):
        User.objects.create_user(**validated_data)
    
    