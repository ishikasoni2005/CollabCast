from django.urls import path
from .views import SlideViewSet, SlideListView

urlpatterns = [
    path('slides/<int:room_id>', SlideViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='slide_list'),
    path('slides/<int:room_id>/<int:pk>', SlideViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='slide_detail'),
    path('slides/<int:room_id>/reorder', SlideViewSet.as_view({
        'post': 'reorder'
    }), name='slide_reorder'),
    # Legacy
    path('slides/<int:room_id>', SlideListView.as_view(), name='slide_list_legacy'),
]