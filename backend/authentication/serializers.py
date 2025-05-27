from rest_framework import serializers

from .models import User


class UserDetailsSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model, exposing essential details.
    """

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name"]
        read_only_fields = ["id", "email"]
