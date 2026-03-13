import json
from urllib.parse import parse_qs

from channels.generic.websocket import AsyncWebsocketConsumer


class ChatConsumer(AsyncWebsocketConsumer):
    # In-memory presence tracking (dev-friendly; resets on server restart)
    _rooms = {}  # room -> { user_id -> {"id":..., "name":...} }

    async def connect(self):
        self.room_id = (self.scope.get("url_route", {}).get("kwargs", {}) or {}).get("room_id") or "lobby"
        self.room_group_name = f"chatroom__{self.room_id}"

        raw_qs = (self.scope.get("query_string") or b"").decode("utf-8", "ignore")
        qs = parse_qs(raw_qs)
        self.user_id = (qs.get("uid", [""]) or [""])[0].strip() or self.channel_name
        self.user_name = (qs.get("name", [""]) or [""])[0].strip() or "Guest"
        self.user = {"id": self.user_id, "name": self.user_name}

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Track presence and notify room
        room = self._rooms.setdefault(self.room_id, {})
        room[self.user_id] = self.user
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "room.presence",
                "users": list(room.values()),
                "event": "join",
                "user": self.user,
            },
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        room = self._rooms.get(self.room_id)
        if room and self.user_id in room:
            room.pop(self.user_id, None)
            if not room:
                self._rooms.pop(self.room_id, None)
                return
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "room.presence",
                    "users": list(room.values()),
                    "event": "leave",
                    "user": self.user,
                },
            )

    async def receive(self, text_data=None, bytes_data=None):
        if not text_data:
            return

        payload = json.loads(text_data)
        message = (payload.get("message", "") or "").strip()
        if not message:
            return

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat.message",
                "message": message,
                "user": self.user,
            },
        )

    async def chat_message(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "chat",
                    "message": event.get("message", ""),
                    "user": event.get("user", {}),
                }
            )
        )

    async def room_presence(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "presence",
                    "event": event.get("event"),
                    "user": event.get("user"),
                    "users": event.get("users", []),
                }
            )
        )
