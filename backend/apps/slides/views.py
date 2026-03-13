from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet
from django.shortcuts import get_object_or_404
from .models import Slide
from .serializers import SlideSerializer, SlideUpdateSerializer

class SlideViewSet(ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        room_id = self.kwargs['room_id']
        return Slide.objects.filter(room_id=room_id)

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return SlideUpdateSerializer
        return SlideSerializer

    def perform_create(self, serializer):
        room_id = self.kwargs['room_id']
        order = Slide.objects.filter(room_id=room_id).count() + 1
        serializer.save(
            room_id=room_id,
            created_by=self.request.user,
            order=order
        )

    @action(detail=False, methods=['post'])
    def reorder(self, request, room_id=None):
        slide_ids = request.data.get('slide_ids', [])
        if not slide_ids:
            return Response({'error': 'slide_ids required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            Slide.reorder_slides(room_id, slide_ids)
            return Response({'message': 'Slides reordered successfully'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Legacy views
class SlideListView(generics.ListCreateAPIView):
    serializer_class = SlideSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        room_id = self.kwargs['room_id']
        return Slide.objects.filter(room_id=room_id)

    def perform_create(self, serializer):
        room_id = self.kwargs['room_id']
        order = Slide.objects.filter(room_id=room_id).count() + 1
        serializer.save(
            room_id=room_id,
            created_by=self.request.user,
            order=order
        )