from rest_framework import serializers
from .models import Room, Participant

class ParticipantSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = Participant
        fields = ['user', 'user_id', 'joined_at', 'left_at', 'is_presenter', 'is_active']

class RoomSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField()
    participants = ParticipantSerializer(source='participant_set', many=True, read_only=True)
    participants_count = serializers.SerializerMethodField()
    is_full = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = ['id', 'name', 'created_by', 'created_at', 'is_active', 'max_participants', 'invite_code', 'participants', 'participants_count', 'is_full']
        read_only_fields = ['created_by', 'created_at']

    def get_participants_count(self, obj):
        return obj.get_participants_count()

    def get_is_full(self, obj):
        return obj.is_full()

class CreateRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['name', 'max_participants']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class RoomInviteSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField()
    participants_count = serializers.SerializerMethodField()
    is_full = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = ['id', 'name', 'created_by', 'max_participants', 'invite_code', 'participants_count', 'is_full']

    def get_participants_count(self, obj):
        return obj.get_participants_count()

    def get_is_full(self, obj):
        return obj.is_full()
