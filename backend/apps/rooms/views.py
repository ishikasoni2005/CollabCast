from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Room, Participant
from .serializers import RoomSerializer, CreateRoomSerializer, ParticipantSerializer, RoomInviteSerializer
from apps.slides.models import Slide


def create_initial_slide(room, user):
    if room.slides.exists():
        return

    Slide.objects.create(
        room=room,
        title='Welcome slide',
        content='Start typing to collaborate live with everyone in this room.',
        order=1,
        background_color='#fff7ed',
        created_by=user,
    )

class RoomViewSet(ModelViewSet):
    queryset = Room.objects.filter(is_active=True)
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateRoomSerializer
        return RoomSerializer

    def perform_create(self, serializer):
        room = serializer.save(created_by=self.request.user)
        # Add creator as participant and presenter
        room.add_participant(self.request.user, is_presenter=True)
        create_initial_slide(room, self.request.user)

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        room = self.get_object()
        try:
            participant = room.add_participant(request.user)
            return Response({'message': 'Joined room successfully', 'participant': ParticipantSerializer(participant).data})
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        room = self.get_object()
        room.remove_participant(request.user)
        return Response({'message': 'Left room successfully'})

    @action(detail=False, methods=['get'])
    def my_rooms(self, request):
        rooms = Room.objects.filter(participant_set__user=request.user, is_active=True).distinct()
        serializer = self.get_serializer(rooms, many=True)
        return Response(serializer.data)

# Legacy views for backward compatibility
class CreateRoomView(generics.CreateAPIView):
    serializer_class = CreateRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        room = serializer.save()
        Participant.objects.create(user=self.request.user, room=room, is_presenter=True)
        create_initial_slide(room, self.request.user)

class RoomDetailView(generics.RetrieveAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [permissions.IsAuthenticated]

class JoinRoomView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, room_id):
        try:
            room = Room.objects.get(id=room_id)
            participant = room.add_participant(request.user)
            return Response({'message': 'Joined room successfully'})
        except Room.DoesNotExist:
            return Response({'error': 'Room not found'}, status=404)
        except ValueError as e:
            return Response({'error': str(e)}, status=400)


class InviteRoomView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_room(self, invite_code):
        return get_object_or_404(Room, invite_code=invite_code, is_active=True)

    def get(self, request, invite_code):
        room = self.get_room(invite_code)
        return Response(RoomInviteSerializer(room).data)

    def post(self, request, invite_code):
        room = self.get_room(invite_code)

        try:
            participant = room.add_participant(request.user)
        except ValueError as error:
            return Response({'error': str(error)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'message': 'Joined room successfully',
            'room': RoomInviteSerializer(room).data,
            'participant': ParticipantSerializer(participant).data,
        })
