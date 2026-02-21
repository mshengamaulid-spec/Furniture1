from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product, Order
from .serializers import ProductSerializer, OrderSerializer


class IsCustomer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "customer"


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "admin"


class IsCarpenterOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ["carpenter", "admin"]


class IsCustomerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ["customer", "admin"]


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["carpenter"]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role == "carpenter":
            return Product.objects.filter(carpenter=user)
        return Product.objects.all()

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAuthenticated(), IsCarpenterOrAdmin()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(carpenter=self.request.user)


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def get_permissions(self):
        if self.action == "create":
            return [permissions.IsAuthenticated(), IsCustomer()]
        if self.action in ["update", "partial_update"]:
            return [permissions.IsAuthenticated(), IsCustomerOrAdmin()]
        if self.action == "destroy":
            return [permissions.IsAuthenticated(), IsCustomerOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Order.objects.none()
        if user.role == "customer":
            return Order.objects.filter(customer=user)
        if user.role == "carpenter":
            return Order.objects.filter(product__carpenter=user)
        return Order.objects.all()

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)
