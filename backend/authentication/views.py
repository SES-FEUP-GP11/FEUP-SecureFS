# authentication/views.py
# from django.shortcuts import render # Keep if you have other non-API views
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .serializers import UserDetailsSerializer  # Import the new serializer


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
        serializer = UserDetailsSerializer(user, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)



