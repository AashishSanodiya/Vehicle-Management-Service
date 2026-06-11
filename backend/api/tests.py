from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Component, Vehicle, ServiceRecord, Issue, Payment
from decimal import Decimal


class ComponentModelTest(TestCase):
    def setUp(self):
        self.component = Component.objects.create(
            name='Brake Pad',
            component_type='part',
            purchase_price=500.00,
            repair_price=200.00,
            stock_quantity=10
        )

    def test_component_creation(self):
        self.assertEqual(self.component.name, 'Brake Pad')
        self.assertEqual(self.component.purchase_price, Decimal('500.00'))

    def test_component_str(self):
        self.assertEqual(str(self.component), 'Brake Pad')


class VehicleModelTest(TestCase):
    def setUp(self):
        self.vehicle = Vehicle.objects.create(
            owner_name='Rahul Sharma',
            owner_phone='9876543210',
            vehicle_number='MP09AB1234',
            vehicle_type='Car',
            brand='Maruti',
            model='Swift',
            year=2020
        )

    def test_vehicle_creation(self):
        self.assertEqual(self.vehicle.vehicle_number, 'MP09AB1234')
        self.assertEqual(self.vehicle.owner_name, 'Rahul Sharma')

    def test_vehicle_str(self):
        self.assertIn('MP09AB1234', str(self.vehicle))


class ServiceRecordTest(TestCase):
    def setUp(self):
        self.vehicle = Vehicle.objects.create(
            owner_name='Test Owner',
            owner_phone='1234567890',
            vehicle_number='TEST001',
            vehicle_type='Car',
            brand='Honda',
            model='City',
            year=2021
        )
        self.component = Component.objects.create(
            name='Oil Filter',
            component_type='part',
            purchase_price=150.00,
            repair_price=50.00,
            stock_quantity=5
        )
        self.service = ServiceRecord.objects.create(
            vehicle=self.vehicle,
            description='Oil change and filter replacement',
            labor_charge=300.00
        )

    def test_service_creation(self):
        self.assertEqual(self.service.status, 'pending')
        self.assertEqual(self.service.vehicle, self.vehicle)

    def test_calculate_total(self):
        Issue.objects.create(
            service_record=self.service,
            title='Replace Oil Filter',
            resolution_type='new_part',
            component=self.component,
            quantity=1,
            unit_price=150.00
        )
        total = self.service.calculate_total()
        # 150 (component) + 300 (labor) = 450
        self.assertEqual(total, Decimal('450.00'))


class ComponentAPITest(APITestCase):
    def test_create_component(self):
        url = reverse('component-list')
        data = {
            'name': 'Spark Plug',
            'component_type': 'part',
            'purchase_price': 80.00,
            'repair_price': 0,
            'stock_quantity': 20,
            'description': 'NGK Spark Plug'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Component.objects.count(), 1)
        self.assertEqual(Component.objects.get().name, 'Spark Plug')

    def test_list_components(self):
        Component.objects.create(name='Test Part', purchase_price=100, repair_price=50, stock_quantity=5)
        url = reverse('component-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


class VehicleAPITest(APITestCase):
    def test_create_vehicle(self):
        url = reverse('vehicle-list')
        data = {
            'owner_name': 'Priya Singh',
            'owner_phone': '9988776655',
            'vehicle_number': 'DL01CA5678',
            'vehicle_type': 'Car',
            'brand': 'Hyundai',
            'model': 'Creta',
            'year': 2022
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_unique_vehicle_number(self):
        Vehicle.objects.create(
            owner_name='Owner 1', owner_phone='111', vehicle_number='SAME001',
            vehicle_type='Car', brand='A', model='B', year=2020
        )
        url = reverse('vehicle-list')
        data = {
            'owner_name': 'Owner 2', 'owner_phone': '222', 'vehicle_number': 'SAME001',
            'vehicle_type': 'Car', 'brand': 'C', 'model': 'D', 'year': 2021
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class IssueAPITest(APITestCase):
    def setUp(self):
        self.vehicle = Vehicle.objects.create(
            owner_name='Test', owner_phone='000', vehicle_number='TEST999',
            vehicle_type='Bike', brand='Hero', model='Splendor', year=2019
        )
        self.service = ServiceRecord.objects.create(
            vehicle=self.vehicle,
            description='General service',
            labor_charge=200
        )
        self.component = Component.objects.create(
            name='Air Filter', purchase_price=120, repair_price=40, stock_quantity=8
        )

    def test_add_issue_with_new_part(self):
        url = reverse('issue-list')
        data = {
            'service_record': self.service.id,
            'title': 'Dirty Air Filter',
            'resolution_type': 'new_part',
            'component': self.component.id,
            'quantity': 1,
            'unit_price': 120.00
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_add_issue_with_repair(self):
        url = reverse('issue-list')
        data = {
            'service_record': self.service.id,
            'title': 'Brake Adjustment',
            'resolution_type': 'repair',
            'component': self.component.id,
            'quantity': 1,
            'unit_price': 40.00
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
