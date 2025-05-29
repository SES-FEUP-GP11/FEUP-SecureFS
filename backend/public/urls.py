from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import PublicPageServeView, PublicPageViewSet

router = DefaultRouter()

router.register(
    r"",
    PublicPageViewSet,
    basename="public-pages",
)

urlpatterns = [
    path(
        "pages/<str:username>/<str:filename>/",
        PublicPageServeView.as_view(),
        name="public-page-serve",
    ),
    path("", include(router.urls)),
]
