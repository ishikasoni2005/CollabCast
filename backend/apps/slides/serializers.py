from rest_framework import serializers
from .models import Slide

class SlideSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField()
    created_by_id = serializers.IntegerField(source='created_by.id', read_only=True)

    class Meta:
        model = Slide
        fields = ['id', 'title', 'content', 'order', 'background_color', 'created_by', 'created_by_id', 'created_at', 'updated_at']
        read_only_fields = ['id', 'order', 'created_by', 'created_by_id', 'created_at', 'updated_at']

class SlideUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Slide
        fields = ['title', 'content', 'background_color']
