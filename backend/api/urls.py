from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ComponentViewSet, VehicleViewSet, ServiceRecordViewSet,
    IssueViewSet, PaymentViewSet, revenue_stats
)

router = DefaultRouter()
router.register(r'components', ComponentViewSet)
router.register(r'vehicles', VehicleViewSet)
router.register(r'services', ServiceRecordViewSet)
router.register(r'issues', IssueViewSet)
router.register(r'payments', PaymentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('revenue/', revenue_stats, name='revenue-stats'),
]
