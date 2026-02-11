from django.contrib import admin
from .models import Product, Order

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'carpenter', 'price', 'created_at')
    list_filter = ('carpenter', 'created_at')
    search_fields = ('name', 'description')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'product', 'quantity', 'total_price', 'status', 'ordered_at')
    list_filter = ('status', 'ordered_at')
    search_fields = ('customer__username', 'product__name')