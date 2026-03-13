from django.urls import re_path

from .consumers import ChatConsumer

websocket_urlpatterns = [
    re_path(r"ws/chat/(?P<room_id>[-_a-zA-Z0-9]{3,64})/$", ChatConsumer.as_asgi()),
]
