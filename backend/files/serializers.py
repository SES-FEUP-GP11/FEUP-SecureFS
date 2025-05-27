from rest_framework import serializers

from .models import FileSystemNode


class FileSystemNodeSerializer(serializers.ModelSerializer):
    owner = serializers.HiddenField(default=serializers.CurrentUserDefault())
    parent = serializers.PrimaryKeyRelatedField(
        queryset=FileSystemNode.objects.all(), allow_null=True
    )

    class Meta:
        model = FileSystemNode
        fields = [
            "id",
            "owner",
            "parent",
            "name",
            "logical_path",
            "is_directory",
            "size_bytes",
            "mime_type",
            "is_public_root",
            "created_at",
            "updated_at",
            "deleted_at",
        ]
        read_only_fields = [
            "id",
            "logical_path",
            "created_at",
            "updated_at",
            "deleted_at",
        ]

    def validate(self, data):
        is_directory = data.get("is_directory", getattr(self.instance, "is_directory", None))
        size_bytes = data.get("size_bytes", getattr(self.instance, "size_bytes", None))
        mime_type = data.get("mime_type", getattr(self.instance, "mime_type", None))

        # Directories must not have file‐only fields set
        if is_directory:
            if size_bytes is not None:
                raise serializers.ValidationError(
                    {"size_bytes": "Directories cannot have size_bytes."}
                )
            if mime_type:
                raise serializers.ValidationError(
                    {"mime_type": "Directories cannot have mime_type."}
                )

        # Files must have both size_bytes and mime_type
        else:
            if size_bytes is None:
                raise serializers.ValidationError({"size_bytes": "Files must have size_bytes set."})
            if not mime_type:
                raise serializers.ValidationError({"mime_type": "Files must have mime_type set."})

        return data
