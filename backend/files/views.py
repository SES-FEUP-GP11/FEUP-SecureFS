import os
import re
import uuid
import magic
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.files.storage import FileSystemStorage
from django.db import IntegrityError
from django.utils import timezone
from django.http import Http404
from django.utils.text import get_valid_filename

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import FileSystemNode
from .serializers import FileSystemNodeSerializer

_NAME_RE = re.compile(r"^[\w.\- ]{1,255}$")


def get_node_by_path(path: str, user):
    if not isinstance(path, str):
        raise Http404("Invalid path format.")

    normalized_path = path.strip("/")
    if not normalized_path:
        return None

    segments = [seg for seg in normalized_path.split("/") if seg]

    for seg_name in segments:
        if not _NAME_RE.fullmatch(seg_name):
            raise Http404(f"Invalid path segment: '{seg_name}'")

    current_parent_node = None
    resolved_node = None

    for i, name_segment in enumerate(segments):
        try:
            query_params = {
                "owner": user,
                "parent": current_parent_node,
                "name": name_segment,
                "deleted_at__isnull": True,
            }
            resolved_node = FileSystemNode.objects.get(**query_params)

            if i < len(segments) - 1 and not resolved_node.is_directory:
                raise Http404(f"Path component '{name_segment}' is a file, not a directory.")

            current_parent_node = resolved_node
        except FileSystemNode.DoesNotExist:
            raise Http404(f"Path not found. Component '{name_segment}' in '{path}' does not exist.")
        except FileSystemNode.MultipleObjectsReturned:
            raise Http404(
                f"Data integrity error: Multiple nodes found for '{name_segment}' in '{path}'."
            )

    return resolved_node


class FileSystemNodeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = FileSystemNodeSerializer

    def get_queryset(self):
        return FileSystemNode.objects.filter(owner=self.request.user, deleted_at__isnull=True)

    def list(self, request, *args, **kwargs):
        user = request.user
        path_param = request.query_params.get("path", "/")

        if not isinstance(path_param, str):
            return Response({"detail": "Invalid path format."}, status=status.HTTP_400_BAD_REQUEST)

        current_logical_path = path_param
        if not current_logical_path.startswith("/"):
            current_logical_path = "/" + current_logical_path
        if current_logical_path != "/" and current_logical_path.endswith("/"):
            current_logical_path = current_logical_path[:-1]

        parent_node_for_listing = None
        try:
            if current_logical_path != "/":
                parent_node_for_listing = get_node_by_path(current_logical_path, user)
                if parent_node_for_listing and not parent_node_for_listing.is_directory:
                    return Response(
                        {"detail": f"Path '{current_logical_path}' is not a directory."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
        except Http404 as e:
            return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        children = (
            self.get_queryset()
            .filter(parent=parent_node_for_listing)
            .order_by("-is_directory", "name")
        )
        serializer = self.get_serializer(children, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="details-by-path")
    def details_by_path(self, request):
        user = request.user
        logical_path = request.query_params.get("path")

        if not logical_path:
            return Response(
                {"detail": "Query parameter 'path' is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not logical_path.startswith("/"):
            logical_path = "/" + logical_path
        if logical_path != "/" and logical_path.endswith("/"):
            logical_path = logical_path[:-1]

        if logical_path == "/":
            return Response(
                {
                    "detail": "Cannot get details for conceptual root '/' via this endpoint. Use list for root content."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            node = get_node_by_path(logical_path, user)
            if node is None:
                raise Http404(f"Node not found at path: {logical_path}")
        except Http404 as e:
            return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(node)
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        node = self.get_object()
        node.deleted_at = timezone.now()
        node.save(update_fields=["deleted_at", "updated_at"])
        # TODO: Implement recursive soft-delete for directory children
        return Response(status=status.HTTP_204_NO_CONTENT)

    def update(self, request, *args, **kwargs):
        raise MethodNotAllowed("PUT")

    def partial_update(self, request, *args, **kwargs):
        raise MethodNotAllowed("PATCH", detail="Use custom actions like 'rename' for updates.")

    @action(
        detail=False,
        methods=["post"],
        url_path="upload",
        parser_classes=[MultiPartParser],
    )
    def upload_file(self, request):
        user = request.user
        parent_id_str = request.data.get("parent", None)
        uploaded_file = request.FILES.get("file")

        if not uploaded_file:
            return Response(
                {"detail": "Missing file in request."}, status=status.HTTP_400_BAD_REQUEST
            )

        # Use get_valid_filename for the name to be stored in DB
        sanitized_db_filename = get_valid_filename(uploaded_file.name)
        if not _NAME_RE.fullmatch(sanitized_db_filename):  # Validate the sanitized name
            return Response(
                {"detail": "Invalid filename characters or length after sanitization."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        parent_node_instance = None
        if parent_id_str:
            try:
                parent_node_instance = FileSystemNode.objects.get(
                    pk=parent_id_str, owner=user, is_directory=True, deleted_at__isnull=True
                )
            except (FileSystemNode.DoesNotExist, ValidationError):
                return Response(
                    {"detail": "Invalid or non-existent parent directory specified."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        try:
            file_buffer = uploaded_file.read(2048)
            detected_mime_type = magic.from_buffer(file_buffer, mime=True)
            uploaded_file.seek(0)
        except Exception as e:
            return Response(
                {"detail": "Could not determine file type."}, status=status.HTTP_400_BAD_REQUEST
            )

        if FileSystemNode.objects.filter(
            owner=user,
            parent=parent_node_instance,
            name=sanitized_db_filename,
            is_directory=False,
            deleted_at__isnull=True,
        ).exists():
            return Response(
                {
                    "detail": f"A file named '{sanitized_db_filename}' already exists in this location."
                },
                status=status.HTTP_409_CONFLICT,
            )

        node_id_for_disk = uuid.uuid4()

        node = FileSystemNode(
            id=node_id_for_disk,
            owner=user,
            parent=parent_node_instance,
            name=sanitized_db_filename,
            is_directory=False,
            size_bytes=uploaded_file.size,
            mime_type=detected_mime_type,
        )

        physical_disk_filename = str(node.id)
        user_storage_dir_segment = str(user.id)
        relative_user_dir = user_storage_dir_segment

        fs_storage_location = os.path.join(
            settings.SECURE_USER_FILES_STORAGE_BASE, relative_user_dir
        )
        os.makedirs(fs_storage_location, exist_ok=True)

        fs = FileSystemStorage(location=fs_storage_location)
        actual_filename_on_disk = None

        try:
            actual_filename_on_disk = fs.save(physical_disk_filename, uploaded_file)
            node.save()
        except Exception as e:
            if actual_filename_on_disk and fs.exists(actual_filename_on_disk):
                fs.delete(actual_filename_on_disk)
            return Response(
                {"detail": "Failed to save file."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        serializer = self.get_serializer(node)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["patch"], url_path="rename")
    def rename(self, request, pk=None):
        node = self.get_object()
        new_name = request.data.get("name")

        if not new_name:
            return Response({"detail": "'name' is required."}, status=status.HTTP_400_BAD_REQUEST)

        sanitized_new_name = get_valid_filename(new_name)  # Uses the imported function
        if not _NAME_RE.fullmatch(sanitized_new_name):
            return Response(
                {"detail": "Invalid new name format after sanitization."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if node.name == sanitized_new_name:
            return Response(
                {"detail": "New name is the same as the current name."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            FileSystemNode.objects.filter(
                owner=request.user,
                parent=node.parent,
                name=sanitized_new_name,
                deleted_at__isnull=True,
            )
            .exclude(pk=node.pk)
            .exists()
        ):
            return Response(
                {"detail": "A file or folder with that name already exists here."},
                status=status.HTTP_409_CONFLICT,
            )

        node.name = sanitized_new_name
        try:
            node.full_clean(
                exclude=[
                    "id",
                    "owner",
                    "parent",
                    "size_bytes",
                    "mime_type",
                    "is_directory",
                    "created_at",
                    "deleted_at",
                ]
            )
        except ValidationError as exc:
            return Response(
                {"detail": exc.message_dict or exc.messages}, status=status.HTTP_400_BAD_REQUEST
            )

        node.save(update_fields=["name", "updated_at"])
        serializer = self.get_serializer(node)
        return Response(serializer.data)
