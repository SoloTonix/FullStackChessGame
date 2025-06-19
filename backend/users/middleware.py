from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import PermissionDenied

class ChessJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        user_auth = super().authenticate(request)
        if user_auth:
            user, _ = user_auth
            if not user.is_active:
                raise PermissionDenied("Account suspended")
        return user_auth