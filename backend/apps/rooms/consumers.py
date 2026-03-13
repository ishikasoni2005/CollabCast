import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
from .models import Room, Participant
from ..slides.models import Slide
from ..chat.models import Message

User = get_user_model()
logger = logging.getLogger(__name__)

class RoomConsumer(AsyncWebsocketConsumer):
    @staticmethod
    def _serialize_slide_data(slide):
        return {
            'id': slide.id,
            'title': slide.title,
            'content': slide.content,
            'order': slide.order,
            'background_color': slide.background_color,
            'created_by': slide.created_by.username,
            'created_by_id': slide.created_by_id,
            'created_at': slide.created_at.isoformat(),
            'updated_at': slide.updated_at.isoformat(),
        }

    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'room_{self.room_id}'
        self.user = self.scope['user']
        self.has_announced_departure = False

        if not self.user.is_authenticated:
            await self.close(code=4001)  # Unauthorized
            return

        # Check if user is participant
        try:
            await self.get_participant()
        except ObjectDoesNotExist:
            await self.close(code=4003)  # Forbidden
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        participants = await self.get_active_participants()
        await self.send(text_data=json.dumps({
            'type': 'participants_snapshot',
            'participants': participants,
        }))
        logger.info(f"User {self.user.username} connected to room {self.room_id}")
        # Notify others
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'participant_joined',
                'username': self.user.username,
            }
        )

    async def disconnect(self, close_code):
        if getattr(self, 'user', None) and self.user.is_authenticated and not self.has_announced_departure:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'participant_left',
                    'username': self.user.username,
                }
            )
            self.has_announced_departure = True

        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        if getattr(self, 'user', None) and self.user.is_authenticated:
            logger.info(f"User {self.user.username} disconnected from room {self.room_id}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            if message_type == 'slide_update':
                await self.handle_slide_update(data)
            elif message_type == 'slide_created':
                await self.handle_slide_created(data)
            elif message_type == 'chat_message':
                await self.handle_chat_message(data)
            elif message_type == 'webrtc_signal':
                await self.handle_webrtc_signal(data)
            elif message_type == 'join_room':
                await self.handle_join_room(data)
            elif message_type == 'leave_room':
                await self.handle_leave_room(data)
            else:
                await self.send_error('Unknown message type')
        except json.JSONDecodeError:
            await self.send_error('Invalid JSON')
        except Exception as e:
            logger.error(f"Error in receive: {e}")
            await self.send_error('Internal server error')

    async def handle_slide_update(self, data):
        slide_id = data.get('slide_id')
        updates = data.get('updates', {})

        try:
            slide = await self.get_slide(slide_id)
            slide_payload = await self.update_slide(slide, updates)
            # Broadcast slide update to room
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'slide_update',
                    'slide_id': slide_id,
                    'slide': slide_payload,
                    'user': self.user.username,
                }
            )
        except ObjectDoesNotExist:
            await self.send_error('Slide not found')
        except Exception as e:
            logger.error(f"Error updating slide: {e}")
            await self.send_error('Failed to update slide')

    async def handle_slide_created(self, data):
        slide_id = data.get('slide_id')

        if not slide_id:
            await self.send_error('Slide id is required')
            return

        try:
            slide = await self.get_slide(slide_id)
            slide_payload = await self.serialize_slide(slide)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'slide_created',
                    'slide': slide_payload,
                    'user': self.user.username,
                }
            )
        except ObjectDoesNotExist:
            await self.send_error('Slide not found')
        except Exception as e:
            logger.error(f"Error broadcasting slide creation: {e}")
            await self.send_error('Failed to broadcast new slide')

    async def handle_chat_message(self, data):
        content = data.get('content', '').strip()
        if not content:
            await self.send_error('Message content cannot be empty')
            return

        try:
            message = await self.create_message(content)
            # Broadcast chat message to room
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': {
                        'id': message.id,
                        'user': message.user.username,
                        'content': message.content,
                        'timestamp': message.timestamp.isoformat(),
                    }
                }
            )
        except Exception as e:
            logger.error(f"Error creating message: {e}")
            await self.send_error('Failed to send message')

    async def handle_webrtc_signal(self, data):
        if 'signal' not in data:
            await self.send_error('Missing WebRTC signal payload')
            return

        # Broadcast WebRTC signal to room (except sender)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'webrtc_signal',
                'signal': data['signal'],
                'from_user': self.user.username,
                'to_user': data.get('to_user'),
            }
        )

    async def handle_join_room(self, data):
        participants = await self.get_active_participants()
        await self.send(json.dumps({
            'type': 'room_joined',
            'room_id': self.room_id,
            'participants': participants,
        }))

    async def handle_leave_room(self, data):
        await self.remove_participant()
        self.has_announced_departure = True
        # broadcast left
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'participant_left',
                'username': self.user.username,
            }
        )
        await self.close()

    # Event handlers for group messages
    async def slide_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'slide_update',
            'slide_id': event['slide_id'],
            'slide': event['slide'],
            'user': event['user'],
        }))

    async def slide_created(self, event):
        await self.send(text_data=json.dumps({
            'type': 'slide_created',
            'slide': event['slide'],
            'user': event['user'],
        }))

    async def participant_joined(self, event):
        await self.send(text_data=json.dumps({
            'type': 'participant_joined',
            'username': event['username'],
        }))

    async def participant_left(self, event):
        await self.send(text_data=json.dumps({
            'type': 'participant_left',
            'username': event['username'],
        }))

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message'],
        }))

    async def webrtc_signal(self, event):
        # deliver only to target user if specified
        if event.get('to_user') and event['to_user'] != self.user.username:
            return
        await self.send(text_data=json.dumps({
            'type': 'webrtc_signal',
            'signal': event['signal'],
            'from_user': event['from_user'],
        }))

    async def send_error(self, message):
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': message,
        }))

    # Database operations
    @database_sync_to_async
    def get_participant(self):
        return Participant.objects.get(
            user=self.user,
            room_id=self.room_id,
            is_active=True
        )

    @database_sync_to_async
    def get_slide(self, slide_id):
        return Slide.objects.get(id=slide_id, room_id=self.room_id)

    @database_sync_to_async
    def get_active_participants(self):
        return list(
            Participant.objects.filter(room_id=self.room_id, is_active=True)
            .select_related('user')
            .order_by('joined_at')
            .values_list('user__username', flat=True)
        )

    @database_sync_to_async
    def update_slide(self, slide, updates):
        for field, value in updates.items():
            if field in ['title', 'content', 'background_color']:
                setattr(slide, field, value)
        slide.save()
        return self._serialize_slide_data(slide)

    @database_sync_to_async
    def serialize_slide(self, slide):
        return self._serialize_slide_data(slide)

    @database_sync_to_async
    def create_message(self, content):
        return Message.objects.create(
            room_id=self.room_id,
            user=self.user,
            content=content
        )

    @database_sync_to_async
    def remove_participant(self):
        Participant.objects.filter(
            user=self.user,
            room_id=self.room_id,
            is_active=True
        ).update(is_active=False)
