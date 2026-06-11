import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Component, Vehicle, ServiceRecord, Issue, Payment
from decimal import Decimal

# Components
components = [
    Component(name='Brake Pad', component_type='part', purchase_price=500, repair_price=200, stock_quantity=20, description='Front/rear brake pads'),
    Component(name='Engine Oil 5W-30', component_type='part', purchase_price=350, repair_price=0, stock_quantity=50),
    Component(name='Oil Filter', component_type='part', purchase_price=150, repair_price=0, stock_quantity=30),
    Component(name='Air Filter', component_type='part', purchase_price=200, repair_price=80, stock_quantity=25),
    Component(name='Spark Plug', component_type='part', purchase_price=80, repair_price=0, stock_quantity=40),
    Component(name='Battery', component_type='part', purchase_price=3500, repair_price=500, stock_quantity=10),
    Component(name='Tyre Rotation', component_type='labor', purchase_price=0, repair_price=300, stock_quantity=0),
    Component(name='AC Service', component_type='labor', purchase_price=0, repair_price=800, stock_quantity=0),
]
for c in components:
    c.save()
print(f"Created {len(components)} components")

# Vehicles
v1 = Vehicle.objects.create(owner_name='Rahul Sharma', owner_phone='9876543210', vehicle_number='MP09AB1234', vehicle_type='Car', brand='Maruti', model='Swift', year=2020)
v2 = Vehicle.objects.create(owner_name='Priya Singh', owner_phone='9988776655', vehicle_number='DL01CA5678', vehicle_type='Car', brand='Hyundai', model='Creta', year=2022)
v3 = Vehicle.objects.create(owner_name='Amit Patel', owner_phone='9765432100', vehicle_number='GJ05XY9900', vehicle_type='Bike', brand='Hero', model='Splendor', year=2019)
print("Created 3 vehicles")

# Service Records
s1 = ServiceRecord.objects.create(vehicle=v1, description='Full service + brake check', labor_charge=500, status='paid')
brake_pad = Component.objects.get(name='Brake Pad')
oil = Component.objects.get(name='Engine Oil 5W-30')
Issue.objects.create(service_record=s1, title='Worn brake pads', resolution_type='new_part', component=brake_pad, quantity=2, unit_price=500)
Issue.objects.create(service_record=s1, title='Engine oil change', resolution_type='new_part', component=oil, quantity=4, unit_price=350)
s1.calculate_total()
Payment.objects.create(service_record=s1, amount=s1.total_amount, payment_method='upi', transaction_id='TXN123ABC')

s2 = ServiceRecord.objects.create(vehicle=v2, description='AC not cooling properly', labor_charge=300, status='completed')
ac = Component.objects.get(name='AC Service')
Issue.objects.create(service_record=s2, title='AC gas refill & service', resolution_type='repair', component=ac, quantity=1, unit_price=800)
s2.calculate_total()

print("Created 2 service records with issues")
print("\nSeed data created successfully!")
