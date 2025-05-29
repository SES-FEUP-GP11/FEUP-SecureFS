from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    # Authentication
    path("api/auth/", include("authentication.urls")),
    # Files
    path("api/files/", include("files.urls")),
    # Sharing
    path("api/sharing/", include("sharing.urls")),
    # Public pages
    path("api/public-pages/", include("public.urls")),
]
