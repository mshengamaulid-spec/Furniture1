from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status, permissions, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserSerializer
from .models import User

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            user = self.get_user(request.data['username'])
            response.data['user'] = UserSerializer(user).data
        return response

    def get_user(self, username):
        from .models import User
        return User.objects.get(username=username)

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "admin"


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-id")
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    http_method_names = ["get", "delete", "head", "options"]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role == "admin":
            return User.objects.all().order_by("-id")
        return User.objects.none()
