from django.shortcuts import render
from rest_framework import views, response, status, permissions
from rest_framework_simplejwt import tokens
from .serialisers import *
# import requests
# Create your views here.
class RegisterView(views.APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        serialiser = UserSerialiser(data=request.data)
        if serialiser.is_valid():
            user = serialiser.save()
            refresh = tokens.RefreshToken.for_user(user)
            return response.Response({
                'user':serialiser.data,
                'refresh': str(refresh),
                'access':str(refresh.access_token)}, status=status.HTTP_201_CREATED)
        return response.Response(serialiser.errors, status=status.HTTP_400_BAD_REQUEST)
            
            
