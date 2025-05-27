import re

from django.shortcuts import get_object_or_404
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from files.models import FileSystemNode
from files.serializers import FileSystemNodeSerializer
from files.views import get_node_by_path
from sharing.models import SharePermission
from sharing.serializers import SharePermissionSerializer

_SEGMENT_RE = re.compile(r"^[^\s/]{1,255}$")


class SharePermissionViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SharePermissionSerializer

    def get_queryset(self):
        return SharePermission.objects.all()

    def perform_create(self, serializer):
        node = serializer.validated_data["node"]
        shared_with_user = serializer.validated_data["shared_with_user"]

        if node.owner != self.request.user:
            raise PermissionDenied("You can only share your own files.")

        if node.is_directory:
            raise ValidationError("Cannot share directories.")

        if shared_with_user == self.request.user:
            raise ValidationError("Cannot share with yourself.")

        serializer.save(granted_by_user=self.request.user)

    @action(detail=False, methods=["get"], url_path="shared-with-me")
    def shared_with_me(self, request):
        """
        Lists FileSystemNode objects shared with you.
        """
        shared_nodes = FileSystemNode.objects.filter(
            shares__shared_with_user=request.user, deleted_at__isnull=True, is_directory=False
        ).distinct()

        serializer = FileSystemNodeSerializer(shared_nodes, many=True)
        return Response(serializer.data)
