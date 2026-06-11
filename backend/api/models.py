from django.db import models


class Component(models.Model):
    COMPONENT_TYPE_CHOICES = [
        ('part', 'Spare Part'),
        ('labor', 'Labor/Service'),
    ]
    name = models.CharField(max_length=200)
    component_type = models.CharField(max_length=20, choices=COMPONENT_TYPE_CHOICES, default='part')
    description = models.TextField(blank=True)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    repair_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stock_quantity = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    manufacturer = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-created_at']

# Vehicle number unique hona chahiye - duplicate entries rokne ke liye
class Vehicle(models.Model):
    owner_name = models.CharField(max_length=200)
    owner_phone = models.CharField(max_length=15)
    vehicle_number = models.CharField(max_length=20, unique=True)
    vehicle_type = models.CharField(max_length=100)
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.vehicle_number} - {self.brand} {self.model}"

    class Meta:
        ordering = ['-created_at']


class ServiceRecord(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('paid', 'Paid'),
    ]
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='service_records')
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    labor_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Service #{self.id} - {self.vehicle.vehicle_number}"

    def calculate_total(self):
        from decimal import Decimal
        issues_total = sum((issue.calculate_cost() for issue in self.issues.all()), Decimal('0'))
        self.total_amount = issues_total + Decimal(str(self.labor_charge))
        self.save()
        return self.total_amount

    class Meta:
        ordering = ['-created_at']


class Issue(models.Model):
    RESOLUTION_CHOICES = [
        ('new_part', 'Use New Component'),
        ('repair', 'Repair Service'),
    ]
    service_record = models.ForeignKey(ServiceRecord, on_delete=models.CASCADE, related_name='issues')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    resolution_type = models.CharField(max_length=20, choices=RESOLUTION_CHOICES, default='new_part')
    component = models.ForeignKey(Component, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def calculate_cost(self):
        return self.unit_price * self.quantity

    def __str__(self):
        return f"Issue: {self.title} (Service #{self.service_record.id})"

    class Meta:
        ordering = ['created_at']


class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('upi', 'UPI'),
        ('bank_transfer', 'Bank Transfer'),
    ]
    service_record = models.OneToOneField(ServiceRecord, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='cash')
    transaction_id = models.CharField(max_length=100, blank=True)
    paid_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Payment #{self.id} - Rs.{self.amount}"

    class Meta:
        ordering = ['-paid_at']
