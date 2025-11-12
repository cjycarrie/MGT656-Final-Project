from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = 'Create a test user student_login / 123456'

    def handle(self, *args, **options):
        User = get_user_model()
        username = 'student_login'
        password = '123456'
        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.NOTICE('User already exists'))
            return
        User.objects.create_user(username=username, password=password)
        self.stdout.write(self.style.SUCCESS('Created user: %s' % username))
