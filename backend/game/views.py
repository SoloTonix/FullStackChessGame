from django.shortcuts import render
from rest_framework import views
from rest_framework import response
from rest_framework import status
from rest_framework import permissions
from .models import *
from .serialisers import *
# import requests
# Create your views here.
class GameView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        game = Game.objects.all()
        serialiser = GameSerialiser(game, many=True)
        return response.Response(serialiser.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serialiser = GameSerialiser(data=request.data)
        if serialiser.is_valid():
            serialiser.save(white_player=request.user)
            return response.Response(serialiser.data, status=status.HTTP_201_CREATED)
        return response.Response(serialiser.errors, status=status.HTTP_400_BAD_REQUEST)