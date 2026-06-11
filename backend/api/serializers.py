from rest_framework import serializers
from .models import Component, Vehicle, ServiceRecord, Issue, Payment


class ComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Component
        fields = '__all__'


class IssueSerializer(serializers.ModelSerializer):
    component_name = serializers.SerializerMethodField()
    total_cost = serializers.SerializerMethodField()

    class Meta:
        model = Issue
        fields = '__all__'

    def get_component_name(self, obj):
        return obj.component.name if obj.component else None

    def get_total_cost(self, obj):
        return obj.calculate_cost()


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'


class ServiceRecordSerializer(serializers.ModelSerializer):
    issues = IssueSerializer(many=True, read_only=True)
    payment = PaymentSerializer(read_only=True)
    vehicle_number = serializers.SerializerMethodField()
    vehicle_info = serializers.SerializerMethodField()

    class Meta:
        model = ServiceRecord
        fields = '__all__'

    def get_vehicle_number(self, obj):
        return obj.vehicle.vehicle_number

    def get_vehicle_info(self, obj):
        return f"{obj.vehicle.brand} {obj.vehicle.model} ({obj.vehicle.vehicle_number})"


class VehicleSerializer(serializers.ModelSerializer):
    service_records = ServiceRecordSerializer(many=True, read_only=True)
    total_services = serializers.SerializerMethodField()

    class Meta:
        model = Vehicle
        fields = '__all__'

    def get_total_services(self, obj):
        return obj.service_records.count()


class VehicleListSerializer(serializers.ModelSerializer):
    total_services = serializers.SerializerMethodField()

    class Meta:
        model = Vehicle
        fields = ['id', 'owner_name', 'owner_phone', 'vehicle_number', 'vehicle_type', 'brand', 'model', 'year', 'total_services', 'created_at']

    def get_total_services(self, obj):
        return obj.service_records.count()
