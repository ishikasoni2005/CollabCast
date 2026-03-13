import secrets

from django.db import migrations, models


def generate_invite_code(Room):
    while True:
        invite_code = secrets.token_hex(4)
        if not Room.objects.filter(invite_code=invite_code).exists():
            return invite_code


def populate_invite_codes(apps, schema_editor):
    Room = apps.get_model('rooms', 'Room')

    for room in Room.objects.filter(invite_code__isnull=True):
        room.invite_code = generate_invite_code(Room)
        room.save(update_fields=['invite_code'])


class Migration(migrations.Migration):

    dependencies = [
        ('rooms', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='room',
            name='invite_code',
            field=models.CharField(blank=True, editable=False, max_length=16, null=True, unique=True),
        ),
        migrations.RunPython(populate_invite_codes, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='room',
            name='invite_code',
            field=models.CharField(editable=False, max_length=16, unique=True),
        ),
    ]
