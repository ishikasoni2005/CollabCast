from django.urls import path
from .views import MessageListView

urlpatterns = [
    path('messages/<int:room_id>', MessageListView.as_view(), name='message_list'),
]