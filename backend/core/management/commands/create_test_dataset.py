from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import Post, Friendship
from django.utils import timezone


class Command(BaseCommand):
    help = 'Create test dataset: users (student_login, alice, bob, charlie), posts, and friendships'

    def handle(self, *args, **options):
        User = get_user_model()
        now = timezone.now()

        users = [
            ('student_login', '123456'),
            ('alice', '123456'),
            ('bob', '123456'),
            ('charlie', '123456'),
        ]

        created_users = []
        for username, password in users:
            user, created = User.objects.get_or_create(username=username)
            if created:
                user.set_password(password)
                user.is_active = True
                user.save()
                created_users.append(username)

        # Create simple posts for alice, bob, charlie
        def ensure_post(username, song_title, artist_name, spotify_url, caption=''):
            try:
                u = User.objects.get(username=username)
            except User.DoesNotExist:
                return False
            # Create post only if not exists for today
            today = timezone.now().date()
            if not Post.objects.filter(user=u, post_date=today).exists():
                Post.objects.create(
                    user=u,
                    song_title=song_title,
                    artist_name=artist_name,
                    spotify_url=spotify_url,
                    caption=caption,
                )
            return True

        ensure_post('alice', 'As It Was', 'Harry Styles', 'https://open.spotify.com/track/example2', 'Throwback')
        ensure_post('bob', 'Blinding Lights', 'The Weeknd', 'https://open.spotify.com/track/example1', 'Love this')
        ensure_post('charlie', 'Levitating', 'Dua Lipa', 'https://open.spotify.com/track/example3', 'Nice beat')

        # Create friendships: make student_login friends with alice and bob (both directions)
        try:
            s = User.objects.get(username='student_login')
            a = User.objects.get(username='alice')
            b = User.objects.get(username='bob')
            # create directed rows both ways to represent mutual friendship
            Friendship.objects.get_or_create(user=s, friend=a)
            Friendship.objects.get_or_create(user=a, friend=s)
            Friendship.objects.get_or_create(user=s, friend=b)
            Friendship.objects.get_or_create(user=b, friend=s)
        except User.DoesNotExist:
            pass

        self.stdout.write(self.style.SUCCESS('Test dataset ensured. Created users: %s' % (', '.join(created_users) or 'none')))
