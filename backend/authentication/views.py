from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, generics # Added generics for ListAPIView

# Assuming your custom User model is in .models
from .models import User 
from .serializers import UserDetailsSerializer

class UserDetailsView(APIView):
    """
    API endpoint that allows authenticated users to retrieve their own details.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        """
        Return details of the currently authenticated user.
        """
        user = request.user
        serializer = UserDetailsSerializer(user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserListView(generics.ListAPIView):
    """
    API endpoint that allows authenticated users to retrieve a list of other users
    in the system, primarily for sharing purposes.
    Excludes the currently authenticated user from the list.
    """
    serializer_class = UserDetailsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        This view should return a list of all users except for
        the currently authenticated user.
        """
        # Exclude the current user from the list
        return User.objects.exclude(pk=self.request.user.pk).order_by('email')