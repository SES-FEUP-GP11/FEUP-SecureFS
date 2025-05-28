# authentication/urls.py
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenBlacklistView,
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

from .views import UserDetailsView, UserListView

app_name = "authentication"

urlpatterns = [
    path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("verify/", TokenVerifyView.as_view(), name="token_verify"),
    path("logout/", TokenBlacklistView.as_view(), name="token_blacklist"),
    path("user/", UserDetailsView.as_view(), name="user_details"),
    path("users/", UserListView.as_view(), name="user_list"),
]
