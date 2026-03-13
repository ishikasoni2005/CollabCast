from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.rooms.models import Participant, Room
from apps.slides.models import Slide


class SlideApiTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.user = user_model.objects.create_user(
            username='slides_tester',
            email='slides_tester@example.com',
            password='pass12345',
        )
        self.room = Room.objects.create(name='Slides Room', created_by=self.user)
        Participant.objects.create(user=self.user, room=self.room, is_presenter=True)
        self.client.force_authenticate(user=self.user)

    def test_create_slide_assigns_order_server_side(self):
        response = self.client.post(
            f'/api/slides/{self.room.id}',
            {
                'title': 'Slide 1',
                'content': 'Hello room',
                'background_color': '#fff7ed',
            },
            format='json',
        )

        response_body = getattr(response, 'data', response.content.decode())
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response_body)
        self.assertEqual(response.data['order'], 1)

        created_slide = Slide.objects.get(room=self.room)
        self.assertEqual(created_slide.title, 'Slide 1')
        self.assertEqual(created_slide.order, 1)
