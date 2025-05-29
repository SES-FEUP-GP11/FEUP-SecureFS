from django.contrib import admin
from django.urls import include, path

from public.views import PublicPageServeView

urlpatterns = [
    path("admin/", admin.site.urls),
    path(
        "published/<str:username>/<str:filename>/",
        PublicPageServeView.as_view(),
        name="public-page-serve",
    ),
    # Authentication
    path("api/auth/", include("authentication.urls")),
    # Files
    path("api/files/", include("files.urls")),
    # Sharing
    path("api/sharing/", include("sharing.urls")),
    # Public pages
    path("api/public-pages/", include("public.urls")),
]
