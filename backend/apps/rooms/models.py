from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import secrets

User = get_user_model()


def generate_invite_code():
    while True:
        invite_code = secrets.token_hex(4)
        if not Room.objects.filter(invite_code=invite_code).exists():
            return invite_code

class Room(models.Model):
    name = models.CharField(max_length=100)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_rooms')
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    max_participants = models.PositiveIntegerField(default=10)
    invite_code = models.CharField(max_length=16, unique=True, editable=False)

    def save(self, *args, **kwargs):
        if not self.invite_code:
            self.invite_code = generate_invite_code()
        return super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    def get_participants_count(self):
        return self.participant_set.filter(is_active=True).count()

    def is_full(self):
        return self.get_participants_count() >= self.max_participants

    def add_participant(self, user, is_presenter=False):
        if self.is_full():
            raise ValueError("Room is full")
        participant, created = Participant.objects.get_or_create(
            user=user,
            room=self,
            defaults={'is_presenter': is_presenter, 'is_active': True}
        )
        if not created and not participant.is_active:
            participant.is_active = True
            participant.joined_at = timezone.now()
            participant.save()
        return participant

    def remove_participant(self, user):
        try:
            participant = self.participant_set.get(user=user, is_active=True)
            participant.is_active = False
            participant.left_at = timezone.now()
            participant.save()
        except Participant.DoesNotExist:
            pass

class Participant(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='room_participations')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='participant_set')
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)
    is_presenter = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['user', 'room']

    def __str__(self):
        return f"{self.user.username} in {self.room.name}"
