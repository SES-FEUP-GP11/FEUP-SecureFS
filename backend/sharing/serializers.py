from django.contrib.auth import get_user_model
from rest_framework import serializers

from files.models import FileSystemNode
from sharing.models import PermissionLevel, SharePermission

User = get_user_model()


class SharePermissionSerializer(serializers.ModelSerializer):
    node = serializers.PrimaryKeyRelatedField(
        queryset=FileSystemNode.objects.all(),
    )
    shared_with_user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    permission_level = serializers.ChoiceField(choices=PermissionLevel.choices)

    class Meta:
        model = SharePermission
        fields = [
            "id",
            "node",
            "shared_with_user",
            "permission_level",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
