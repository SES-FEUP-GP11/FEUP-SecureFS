import uuid
from django.db import models


class File(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    storage_path = models.CharField(
        max_length=1024,
        unique=True,
    )
    size = models.BigIntegerField()
    sha256 = models.CharField(
        max_length=64,
    )
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)
