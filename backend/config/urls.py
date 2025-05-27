from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    # Authentication endpoints
    path("api/auth/", include("authentication.urls")),
    # Files
    path("api/files/", include("files.urls")),
]
