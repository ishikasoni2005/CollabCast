from urllib.parse import parse_qs

from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.db import close_old_connections
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


@database_sync_to_async
def get_user_for_token(token: str):
    jwt_auth = JWTAuthentication()

    try:
        validated_token = jwt_auth.get_validated_token(token)
        return jwt_auth.get_user(validated_token)
    except (AuthenticationFailed, InvalidToken, TokenError):
        return AnonymousUser()


class JWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        close_old_connections()

        query_string = parse_qs(scope["query_string"].decode())
        token = query_string.get("token", [None])[0]

        if token:
            scope["user"] = await get_user_for_token(token)

        return await self.inner(scope, receive, send)


def JWTAuthMiddlewareStack(inner):
    return AuthMiddlewareStack(JWTAuthMiddleware(inner))
