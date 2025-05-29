import os

import magic
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.views import View
from rest_framework import status, viewsets
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import PublicPage
from .serializers import PublicPageSerializer


class PublicPageViewSet(viewsets.ModelViewSet):
    """
    CRUD for user-published HTML pages,
    """

    serializer_class = PublicPageSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return PublicPage.objects.filter(owner=self.request.user).order_by("-created_at")

    def create(self, request, *args, **kwargs):
        html_file = request.data.get("html_file")
        if not html_file:
            return Response(
                {"detail": '"html_file" is required.'}, status=status.HTTP_400_BAD_REQUEST
            )

        derived_name = html_file.name
        serializer = self.get_serializer(data={"name": derived_name})
        serializer.is_valid(raise_exception=True)

        # MIME sniff
        try:
            header = html_file.read(2048)
            mime_type = magic.from_buffer(header, mime=True)
            html_file.seek(0)
        except Exception:
            return Response(
                {"detail": "Unable to determine MIME type."}, status=status.HTTP_400_BAD_REQUEST
            )
        if mime_type.lower() != "text/html":
            return Response(
                {"detail": f"Invalid MIME type: {mime_type}. Only text/html allowed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        page = PublicPage(owner=request.user, name=serializer.validated_data["name"])
        page.save()

        # filesystem storage setup
        user_dir = os.path.join(settings.PUBLIC_PAGES_STORAGE_BASE, str(request.user.id))
        os.makedirs(user_dir, exist_ok=True)
        fs = FileSystemStorage(location=user_dir)

        phys_name = f"{page.physical_storage_filename}.html"
        saved_name = None
        try:
            saved_name = fs.save(phys_name, html_file)
        except Exception:
            if saved_name and fs.exists(saved_name):
                fs.delete(saved_name)
            page.delete()
            return Response(
                {"detail": "Failed to save file."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(self.get_serializer(page).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        page = self.get_object()
        html_file = request.data.get("html_file")
        if not html_file:
            return Response(
                {"detail": '"html_file" is required for update.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        new_name = html_file.name
        serializer = self.get_serializer(page, data={"name": new_name}, partial=True)
        serializer.is_valid(raise_exception=True)
        page.name = serializer.validated_data["name"]

        # MIME sniff & overwrite file
        try:
            header = html_file.read(2048)
            mime_type = magic.from_buffer(header, mime=True)
            html_file.seek(0)
        except Exception:
            return Response(
                {"detail": "Unable to determine MIME type."}, status=status.HTTP_400_BAD_REQUEST
            )
        if mime_type.lower() != "text/html":
            return Response(
                {"detail": f"Invalid MIME type: {mime_type}."}, status=status.HTTP_400_BAD_REQUEST
            )

        user_dir = os.path.join(settings.PUBLIC_PAGES_STORAGE_BASE, str(request.user.id))
        os.makedirs(user_dir, exist_ok=True)
        fs = FileSystemStorage(location=user_dir)

        phys_name = f"{page.physical_storage_filename}.html"

        if fs.exists(phys_name):
            fs.delete(phys_name)

        try:
            fs.save(phys_name, html_file)
        except Exception:
            return Response(
                {"detail": "Failed to overwrite file."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        page.save(update_fields=["name", "updated_at"])
        return Response(self.get_serializer(page).data)

    def destroy(self, request, *args, **kwargs):
        page = self.get_object()

        user_dir = os.path.join(settings.PUBLIC_PAGES_STORAGE_BASE, str(request.user.id))
        fs = FileSystemStorage(location=user_dir)

        phys_name = f"{page.physical_storage_filename}.html"

        if fs.exists(phys_name):
            try:
                fs.delete(phys_name)
            except Exception:
                pass

        page.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class PublicPageServeView(View):
    """
    Serve a user's public HTML page at URL like:
      GET /pages/{username}/{filename}
    """

    def get(self, request, username, filename):

        page = get_object_or_404(PublicPage, owner__username=username, name=filename)

        user_dir = os.path.join(settings.PUBLIC_PAGES_STORAGE_BASE, str(page.owner_id))

        disk_name = f"{page.physical_storage_filename}.html"
        file_path = os.path.join(user_dir, disk_name)

        if not os.path.isfile(file_path):
            raise Response({"detail": "File not found."}, status=status.HTTP_404_NOT_FOUND)

        response = FileResponse(open(file_path, "rb"), content_type="text/html")

        # Security hardening headers
        response["X-Content-Type-Options"] = "nosniff"
        response["Content-Security-Policy"] = "default-src 'self';"
        response["Cache-Control"] = "public, max-age=3600"
        response["X-Frame-Options"] = "DENY"

        return response
