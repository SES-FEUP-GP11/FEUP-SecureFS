from django.urls import include, path
from rest_framework.routers import DefaultRouter

from sharing.views import SharePermissionViewSet

router = DefaultRouter()

router.register(r"", SharePermissionViewSet, basename="sharing")

urlpatterns = [
    path("", include(router.urls)),
]
