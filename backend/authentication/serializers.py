from rest_framework import serializers
from .models import User # Assuming your custom User model is in authentication.models

class UserDetailsSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model, exposing essential details.
    """
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name'] 
        # Add any other fields you want to expose about the user
        # Note: 'username' is intentionally omitted as it's set to None on your custom User model.
        # The frontend 'User' type currently has a 'username' field. 
        # You might consider populating it with the email on the frontend, 
        # or adding a 'get_display_name' property to your User model that the frontend can use.
        read_only_fields = ['id', 'email'] # Email is USERNAME_FIELD, typically not changed often after creation