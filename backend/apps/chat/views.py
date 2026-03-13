from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.pagination import PageNumberPagination
from apps.rooms.models import Participant
from .models import Message
from .serializers import MessageSerializer

class MessagePagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100

class MessageListView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = MessagePagination

    def validate_participation(self):
        room_id = self.kwargs['room_id']
        is_participant = Participant.objects.filter(
            room_id=room_id,
            user=self.request.user,
            is_active=True,
        ).exists()

        if not is_participant:
            raise PermissionDenied('You must join the room before accessing messages.')

    def get_queryset(self):
        self.validate_participation()
        room_id = self.kwargs['room_id']
        return Message.objects.filter(room_id=room_id).select_related('user')

    def perform_create(self, serializer):
        self.validate_participation()
        room_id = self.kwargs['room_id']
        serializer.save(room_id=room_id, user=self.request.user)
