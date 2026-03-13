from django.db import models

class Message(models.Model):
    MESSAGE_TYPES = [
        ('text', 'Text'),
        ('system', 'System'),
        ('file', 'File'),
    ]

    room = models.ForeignKey('rooms.Room', on_delete=models.CASCADE, related_name='messages')
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='messages')
    content = models.TextField()
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='text')
    timestamp = models.DateTimeField(auto_now_add=True)
    edited = models.BooleanField(default=False)
    edited_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.user.username} ({self.message_type}): {self.content[:50]}"