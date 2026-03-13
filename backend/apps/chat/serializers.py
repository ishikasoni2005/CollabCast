from rest_framework import serializers
from .models import Message

class MessageSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'user', 'user_id', 'content', 'message_type', 'timestamp', 'edited', 'edited_at']
        read_only_fields = ['user', 'timestamp', 'edited', 'edited_at']