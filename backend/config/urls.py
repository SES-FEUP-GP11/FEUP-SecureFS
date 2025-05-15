from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),

    # Users endpoints
    path('api/users/', include('users.urls')),

    # Files
    path('api/files/', include('files.urls')),

    # Sharing
    path('api/sharing/', include('sharing.urls')),

    # Public pages (you could move this into its own app if you prefer)
    path('public/<str:username>/', include('config.public_urls')),
]
