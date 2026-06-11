from django.contrib import admin
from .models import Component, Vehicle, ServiceRecord, Issue, Payment

@admin.register(Component)
class ComponentAdmin(admin.ModelAdmin):
    list_display = ['name', 'component_type', 'purchase_price', 'repair_price', 'stock_quantity']
    list_filter = ['component_type']
    search_fields = ['name']

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ['vehicle_number', 'owner_name', 'owner_phone', 'brand', 'model', 'year']
    search_fields = ['vehicle_number', 'owner_name']

@admin.register(ServiceRecord)
class ServiceRecordAdmin(admin.ModelAdmin):
    list_display = ['id', 'vehicle', 'status', 'total_amount', 'created_at']
    list_filter = ['status']

@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = ['title', 'service_record', 'resolution_type', 'unit_price', 'quantity']

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'service_record', 'amount', 'payment_method', 'paid_at']
