import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import TextChoices

from files.models import FileSystemNode


class PermissionLevel(TextChoices):
    VIEW = "view", "View"
    EDIT = "edit", "Edit"


class SharePermission(models.Model):
    """
    Manages sharing permissions for FileSystemNodes between users.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    node = models.ForeignKey(
        FileSystemNode,
        on_delete=models.CASCADE,
        related_name="shares",
    )

    shared_with_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="shared_with_me",
    )
    granted_by_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="granted_shares",
    )
    permission_level = models.CharField(max_length=10, choices=PermissionLevel.choices)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [["node", "shared_with_user"]]

    def clean(self):
        if self.node.is_directory:
            raise ValidationError("Cannot share directories.")
