from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.db.models.functions import TruncDay, TruncMonth, TruncYear
from datetime import datetime, timedelta
from .models import Component, Vehicle, ServiceRecord, Issue, Payment
from .serializers import (
    ComponentSerializer, VehicleSerializer, VehicleListSerializer,
    ServiceRecordSerializer, IssueSerializer, PaymentSerializer
)


class ComponentViewSet(viewsets.ModelViewSet):
    queryset = Component.objects.all()
    serializer_class = ComponentSerializer


class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return VehicleListSerializer
        return VehicleSerializer


class ServiceRecordViewSet(viewsets.ModelViewSet):
    queryset = ServiceRecord.objects.all()
    serializer_class = ServiceRecordSerializer

    def get_queryset(self):
        queryset = ServiceRecord.objects.all()
        vehicle_id = self.request.query_params.get('vehicle_id')
        if vehicle_id:
            queryset = queryset.filter(vehicle_id=vehicle_id)
        return queryset

    @action(detail=True, methods=['post'])
    def calculate_total(self, request, pk=None):
        service = self.get_object()
        total = service.calculate_total()
        return Response({'total_amount': total, 'message': 'Total calculated successfully'})

    @action(detail=True, methods=['post'])
    def process_payment(self, request, pk=None):
        service = self.get_object()

        if service.status == 'paid':
            return Response({'error': 'Service already paid'}, status=status.HTTP_400_BAD_REQUEST)

        service.calculate_total()

        payment_method = request.data.get('payment_method', 'cash')
        notes = request.data.get('notes', '')
        amount = float(service.total_amount)

        import uuid
        transaction_id = str(uuid.uuid4())[:12].upper()

        payment = Payment.objects.create(
            service_record=service,
            amount=amount,
            payment_method=payment_method,
            transaction_id=transaction_id,
            notes=notes
        )

        service.paid_amount = amount
        service.status = 'paid'
        service.save()

        serializer = PaymentSerializer(payment)
        return Response({
            'payment': serializer.data,
            'message': f'Payment of Rs.{amount} processed successfully',
            'transaction_id': transaction_id
        })


class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer

    def get_queryset(self):
        queryset = Issue.objects.all()
        service_id = self.request.query_params.get('service_id')
        if service_id:
            queryset = queryset.filter(service_record_id=service_id)
        return queryset

    def perform_create(self, serializer):
        issue = serializer.save()
        issue.service_record.calculate_total()

    def perform_update(self, serializer):
        issue = serializer.save()
        issue.service_record.calculate_total()

    def perform_destroy(self, instance):
        service = instance.service_record
        instance.delete()
        service.calculate_total()


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer


from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def revenue_stats(request):
    period = request.query_params.get('period', 'monthly')

    payments = Payment.objects.filter(service_record__status='paid')

    if period == 'daily':
        days = int(request.query_params.get('days', 30))
        start_date = datetime.now() - timedelta(days=days)
        data = (
            payments.filter(paid_at__gte=start_date)
            .annotate(date=TruncDay('paid_at'))
            .values('date')
            .annotate(revenue=Sum('amount'), count=Count('id'))
            .order_by('date')
        )
        result = [
            {
                'date': item['date'].strftime('%d %b'),
                'revenue': float(item['revenue']),
                'count': item['count']
            }
            for item in data
        ]

    elif period == 'monthly':
        year = int(request.query_params.get('year', datetime.now().year))
        data = (
            payments.filter(paid_at__year=year)
            .annotate(month=TruncMonth('paid_at'))
            .values('month')
            .annotate(revenue=Sum('amount'), count=Count('id'))
            .order_by('month')
        )
        result = [
            {
                'date': item['month'].strftime('%b %Y'),
                'revenue': float(item['revenue']),
                'count': item['count']
            }
            for item in data
        ]

    elif period == 'yearly':
        data = (
            payments
            .annotate(year=TruncYear('paid_at'))
            .values('year')
            .annotate(revenue=Sum('amount'), count=Count('id'))
            .order_by('year')
        )
        result = [
            {
                'date': item['year'].strftime('%Y'),
                'revenue': float(item['revenue']),
                'count': item['count']
            }
            for item in data
        ]
    else:
        result = []

    total_revenue = payments.aggregate(total=Sum('amount'))['total'] or 0
    total_services = ServiceRecord.objects.filter(status='paid').count()
    pending_services = ServiceRecord.objects.exclude(status='paid').count()

    return Response({
        'period': period,
        'data': result,
        'summary': {
            'total_revenue': float(total_revenue),
            'total_paid_services': total_services,
            'pending_services': pending_services,
        }
    })
