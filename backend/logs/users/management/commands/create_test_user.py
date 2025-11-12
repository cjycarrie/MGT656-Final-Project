from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Create or update a test user for front-end integration"

    def add_arguments(self, parser):
        parser.add_argument('--username', default='student_login', help='Username to create')
        parser.add_argument('--password', default='student123', help='Password to set')
        parser.add_argument('--email', default='student@example.com', help='Email to set')

    def handle(self, *args, **options):
        from django.contrib.auth import get_user_model

        User = get_user_model()
        username = options['username']
        password = options['password']
        email = options['email']

        user, created = User.objects.get_or_create(username=username)
        user.email = email
        user.set_password(password)
        user.is_active = True
        user.save()

        if created:
            self.stdout.write(self.style.SUCCESS(f"Created user {username}"))
        else:
            self.stdout.write(self.style.SUCCESS(f"Updated user {username} (password reset)"))
