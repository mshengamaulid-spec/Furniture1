from rest_framework import serializers
from .models import Product, Order

class ProductSerializer(serializers.ModelSerializer):
    carpenter = serializers.PrimaryKeyRelatedField(read_only=True)
    carpenter_name = serializers.CharField(source='carpenter.username', read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'carpenter', 'carpenter_name', 'name', 'description', 'price', 'image', 'created_at', 'updated_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        image = data.get('image')
        request = self.context.get('request')
        if image and request is not None:
            data['image'] = request.build_absolute_uri(image)
        return data

class OrderSerializer(serializers.ModelSerializer):
    customer = serializers.PrimaryKeyRelatedField(read_only=True)
    customer_name = serializers.CharField(source='customer.username', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'customer', 'customer_name', 'product', 'product_name', 'quantity', 'total_price', 'status', 'ordered_at']

    def validate(self, attrs):
        request = self.context.get('request')
        is_update = self.instance is not None
        if (
            is_update
            and request
            and request.user.is_authenticated
            and request.user.role == "customer"
        ):
            allowed_fields = {"quantity"}
            unexpected_fields = set(attrs.keys()) - allowed_fields
            if unexpected_fields:
                raise serializers.ValidationError(
                    "Customers can only update the quantity on their orders."
                )
        return attrs
