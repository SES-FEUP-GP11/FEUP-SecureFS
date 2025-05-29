from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import PublicPageViewSet

router = DefaultRouter()

router.register(
    r"",
    PublicPageViewSet,
    basename="public-pages",
)

urlpatterns = [
    path("", include(router.urls)),
]
