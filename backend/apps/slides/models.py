from django.db import models
from django.core.exceptions import ValidationError

class Slide(models.Model):
    room = models.ForeignKey('rooms.Room', on_delete=models.CASCADE, related_name='slides')
    title = models.CharField(max_length=200, blank=True)
    content = models.TextField()
    order = models.PositiveIntegerField()
    background_color = models.CharField(max_length=7, default='#ffffff')  # Hex color
    created_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='created_slides')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']
        unique_together = ['room', 'order']

    def __str__(self):
        return f"Slide {self.order}: {self.title or 'Untitled'} in {self.room.name}"

    def clean(self):
        if self.order < 1:
            raise ValidationError("Order must be positive")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    @classmethod
    def reorder_slides(cls, room, new_order):
        """
        Reorder slides in a room.
        new_order is a list of slide ids in new order.
        """
        for index, slide_id in enumerate(new_order, 1):
            cls.objects.filter(id=slide_id, room=room).update(order=index)