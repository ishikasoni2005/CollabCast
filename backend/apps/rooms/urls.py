from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RoomViewSet, CreateRoomView, RoomDetailView, JoinRoomView, InviteRoomView

router = DefaultRouter()
router.register(r'rooms', RoomViewSet)

urlpatterns = [
    path('rooms/invite/<str:invite_code>', InviteRoomView.as_view(), name='invite_room'),
    path('', include(router.urls)),
    # Legacy URLs
    path('rooms/create', CreateRoomView.as_view(), name='create_room'),
    path('rooms/<int:pk>', RoomDetailView.as_view(), name='room_detail'),
    path('rooms/<int:room_id>/join', JoinRoomView.as_view(), name='join_room'),
]
