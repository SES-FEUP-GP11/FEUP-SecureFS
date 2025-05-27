import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class FileSystemNode(models.Model):
    """
    Represents a file or a directory in the user's virtual file system.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="owned_nodes"
    )
    parent = models.ForeignKey(
        "self", null=True, blank=True, on_delete=models.CASCADE, related_name="children"
    )

    name = models.CharField(max_length=255)
    is_directory = models.BooleanField(default=False)

    # file-only
    size_bytes = models.BigIntegerField(null=True)
    mime_type = models.CharField(max_length=100, null=True)

    # public-page helper
    is_public_root = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # For soft deletes
    deleted_at = models.DateTimeField(null=True, blank=True)

    @property
    def logical_path(self):
        """
        Constructs and returns the full logical path for this node.
        Example: /Documents/MySubfolder/MyFile.txt
        """
        path_parts = []
        current_node = self
        while current_node is not None:
            path_parts.append(current_node.name)
            current_node = current_node.parent

        return "/" + "/".join(reversed(path_parts))

    class Meta:
        unique_together = ("owner", "parent", "name", "deleted_at")
        indexes = [
            models.Index(fields=["owner"]),
            models.Index(fields=["parent"]),
        ]

    def clean(self):
        if self.is_directory and self.size_bytes is not None:
            raise ValidationError("Directories cannot have size_bytes.")
        if not self.is_directory and self.size_bytes is None:
            raise ValidationError("Files must have size_bytes set.")
