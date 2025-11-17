from django.conf import settings
from django.db import models
from django.utils import timezone

User = settings.AUTH_USER_MODEL


class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    song_title = models.CharField(max_length=255)
    artist_name = models.CharField(max_length=255)
    spotify_url = models.URLField(max_length=500, blank=True, null=True)
    caption = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    post_date = models.DateField(default=timezone.now, db_index=True)

    class Meta:
        db_table = 'trackly_post'
        managed = False
        constraints = [
            models.UniqueConstraint(fields=['user', 'post_date'], name='trackly_post_uniq_per_user_per_day')
        ]

    def __str__(self):
        return f'{self.user} - {self.song_title} ({self.post_date})'


class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'trackly_like'
        managed = False
        constraints = [
            models.UniqueConstraint(fields=['user', 'post'], name='trackly_like_uniq_per_user_per_post')
        ]

    def __str__(self):
        return f'{self.user} likes {self.post}'


class Friendship(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friendships')
    friend = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friend_of')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'trackly_friendship'
        managed = False
        constraints = [
            models.UniqueConstraint(fields=['user', 'friend'], name='trackly_friendship_uniq_pair')
        ]

    def __str__(self):
        return f'{self.user} -> {self.friend}'
