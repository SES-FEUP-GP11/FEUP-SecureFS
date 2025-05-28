import os
import re

import magic
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.files.storage import FileSystemStorage
from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.parsers import FileUploadParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import FileSystemNode
from .serializers import FileSystemNodeSerializer

_NAME_RE = re.compile(r"^[\w.\- ]{1,255}$")


def get_node_by_path(path: str, user):
    segments = [seg for seg in path.strip().split("/") if seg]

    for seg in segments:
        if not _NAME_RE.fullmatch(seg):
            raise ValueError(f"Invalid path segment")

    node = None
    qs = FileSystemNode.objects.filter(owner=user, deleted_at__isnull=True)
    for name in segments:
        node = qs.get(parent=node, name=name)
    return node or None


class FileSystemNodeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = FileSystemNodeSerializer

    def get_queryset(self):
        return FileSystemNode.objects.filter(owner=self.request.user, deleted_at__isnull=True)

    def list(self, request, *args, **kwargs):
        # list children under a logical path (root by default)

        path = request.query_params.get("path", "/")

        if not isinstance(path, str):
            return Response({"detail": "Invalid path format."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            parent = get_node_by_path(path, request.user)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except FileSystemNode.DoesNotExist:
            return Response({"detail": f"Path not found: {path}"}, status=status.HTTP_404_NOT_FOUND)

        if parent is None:
            children = self.get_queryset().filter(parent=None)
        else:
            children = parent.children.filter(deleted_at__isnull=True)

        serializer = self.get_serializer(children, many=True)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """
        Soft-deletes the specified file or directory.
        """
        node = self.get_object()
        node.deleted_at = timezone.now()
        node.save(update_fields=["deleted_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)

    def update(self, request, *args, **kwargs):
        """
        Disable generic PUT /files/{pk}/
        """
        raise MethodNotAllowed("PUT")

    def partial_update(self, request, *args, **kwargs):
        """
        Disable generic PATCH /files/{pk}/
        """
        raise MethodNotAllowed("PATCH")

    @action(
        detail=False,
        methods=["post"],
        url_path="upload",
        parser_classes=[MultiPartParser, FileUploadParser],
    )
    def upload_file(self, request):
        """
        POST /files/upload/

        body=multipart/form-data:
          - file (required)
          - parent (UUID of directory)
        """

        file = request.data.get("file")
        parent_id = request.data.get("parent_id", None)

        if not file:
            return Response(
                {"detail": "Missing file in request."}, status=status.HTTP_400_BAD_REQUEST
            )

        if not _NAME_RE.fullmatch(file.name):
            return Response({"detail": "Invalid filename."}, status=status.HTTP_400_BAD_REQUEST)

        if parent_id:
            parent = get_object_or_404(
                FileSystemNode, pk=parent_id, owner=request.user, deleted_at__isnull=True
            )

            if not parent.is_directory:
                return Response(
                    {"detail": "Specified parent is not a directory."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Server side MIME type validation
        try:
            file_buffer = file.read(2048)
            detected_mime_type = magic.from_buffer(file_buffer, mime=True)
            file.seek(0)
        except Exception as e:
            return Response(
                {"detail": "Could not determine file type."}, status=status.HTTP_400_BAD_REQUEST
            )

        if detected_mime_type not in settings.ALLOWED_UPLOAD_MIME_TYPES:
            return Response(
                {"detail": f"File type '{detected_mime_type}' not allowed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        file_data = {
            "name": file.name,
            "is_directory": False,
            "size_bytes": file.size,
            "mime_type": detected_mime_type,
            "parent": parent_id,
        }

        serializer = self.get_serializer(data=file_data)
        print(f"Uploading file: {serializer}")
        serializer.is_valid(raise_exception=True)

        node = serializer.save()

        print(f"Uploading file: {file_data}")

        storage = FileSystemStorage(
            location=os.path.join(settings.SECURE_USER_FILES_STORAGE_BASE, str(request.user.id))
        )

        os.makedirs(storage.location, exist_ok=True)
        physical_disk_filename = str(node.id)

        try:
            storage.save(physical_disk_filename, file)
        except Exception as e:
            node.delete()

            return Response(
                {"detail": "Failed to save file to storage."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["patch"], url_path="rename")
    def rename(self, request, pk=None):
        """
        PATCH /files/{pk}/rename/
        body: { "name": "new-name.txt" }
        """
        node = self.get_object()
        new_name = request.data.get("name")

        if not new_name:
            return Response({"detail": "'name' is required."}, status=status.HTTP_400_BAD_REQUEST)

        if not _NAME_RE.fullmatch(new_name):
            return Response({"detail": "Invalid name format."}, status=status.HTTP_400_BAD_REQUEST)

        # 3) check unique_together: owner + parent + name + deleted_at
        conflict_qs = FileSystemNode.objects.filter(
            owner=request.user, parent=node.parent, name=new_name, deleted_at__isnull=True
        ).exclude(pk=node.pk)
        if conflict_qs.exists():
            return Response(
                {"detail": "A file or folder with that name already exists here."},
                status=status.HTTP_409_CONFLICT,
            )
        print(f"Renamed node {node.id} to {new_name}")
        node.name = new_name
        try:
            node.full_clean()
        except ValidationError as exc:
            print(f"Validation error: {exc}")
            return Response(
                {"detail": exc.message_dict or exc.messages}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            node.save(update_fields=["name", "updated_at"])
        except IntegrityError:
            return Response(
                {"detail": "Could not rename due to a naming conflict."},
                status=status.HTTP_409_CONFLICT,
            )

        return Response(self.get_serializer(node).data)
