"""
ASGI config for collabcast project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
import apps.rooms.routing
from .jwt_auth import JWTAuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'collabcast.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JWTAuthMiddlewareStack(
        URLRouter(
            apps.rooms.routing.websocket_urlpatterns
        )
    ),
})
