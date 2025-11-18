from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = 'Create several test users (student_login, alice, bob, charlie) with password 123456'

    def handle(self, *args, **options):
        User = get_user_model()
        users = [
            ('student_login', '123456'),
            ('alice', '123456'),
            ('bob', '123456'),
            ('charlie', '123456'),
        ]
        created = []
        for username, password in users:
            if User.objects.filter(username=username).exists():
                self.stdout.write(self.style.NOTICE(f'User already exists: {username}'))
                continue
            User.objects.create_user(username=username, password=password)
            created.append(username)

        if created:
            self.stdout.write(self.style.SUCCESS('Created users: %s' % ', '.join(created)))
        else:
            self.stdout.write(self.style.NOTICE('No users created (all already existed)'))
