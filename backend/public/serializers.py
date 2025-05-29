import re

from django.core.exceptions import ValidationError
from rest_framework import serializers

from .models import PublicPage

_HTML_FILENAME_REGEX = re.compile(r"^[A-Za-z0-9._-]{1,250}\.html$")


class PublicPageSerializer(serializers.ModelSerializer):
    owner = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = PublicPage
        fields = [
            "id",
            "owner",
            "name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def validate_name(self, value):
        name = value.strip()
        if not _HTML_FILENAME_REGEX.fullmatch(name):
            raise serializers.ValidationError(
                "Filename must be 6–255 chars, only letters/digits/._- and end with '.html'."
            )
        return name
