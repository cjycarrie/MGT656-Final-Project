1. Trackly DB Spec
Use the standard Django auth_user table for authentication.
 All Trackly-specific tables live in the public schema:
trackly_post


trackly_like


trackly_friendship



1.1 Table trackly_post
Purpose:
 Stores the daily track post for each user. A user can create at most one post per day.
Columns
Column
Type
Constraints
Description
id
INTEGER
Primary Key, identity
Unique post ID
user_id
INTEGER
NOT NULL, Foreign Key → auth_user(id)
Author of the post
song_title
VARCHAR(255)
NOT NULL
Song title
artist_name
VARCHAR(255)
NOT NULL
Artist name
spotify_url
VARCHAR(500)
NULLABLE
Optional Spotify (or other) link
caption
TEXT
NULLABLE
Optional text caption
created_at
TIMESTAMPTZ
NOT NULL, default NOW()
When the post was created
post_date
DATE
NOT NULL, default CURRENT_DATE
Logical “day” of the post

Constraints / Indexes
CONSTRAINT trackly_post_uniq_per_user_per_day UNIQUE (user_id, post_date)
 → Enforces one post per user per day.


Index: idx_trackly_post_user_id on (user_id)


Index: idx_trackly_post_post_date on (post_date)


1.2 Table trackly_like
Purpose:
 Stores likes of posts by users.
Columns
Column
Type
Constraints
Description
id
INTEGER
Primary Key, identity
Unique like ID
user_id
INTEGER
NOT NULL, FK → auth_user(id)
User who liked the post
post_id
INTEGER
NOT NULL, FK → trackly_post(id)
Liked post
created_at
TIMESTAMPTZ
NOT NULL, default NOW()
When the like was created

Constraints / Indexes
CONSTRAINT trackly_like_uniq_per_user_per_post UNIQUE (user_id, post_id)
 → A user can like a given post at most once.


Index: idx_trackly_like_user_id on (user_id)


Index: idx_trackly_like_post_id on (post_id)


1.3 Table trackly_friendship
Purpose:
 Represents friendship relations.
Store directed rows (user_id → friend_id). Two reciprocal rows mean mutual friendship.
Columns
Column
Type
Constraints
Description
id
INTEGER
Primary Key, identity
Unique row ID
user_id
INTEGER
NOT NULL, Foreign Key → auth_user(id)
The user
friend_id
INTEGER
NOT NULL, Foreign Key → auth_user(id)
A friend of user_id
created_at
TIMESTAMPTZ
NOT NULL, default NOW()
When the relation was created

Constraints / Indexes
CONSTRAINT trackly_friendship_uniq_pair UNIQUE (user_id, friend_id)
 → No duplicate rows.


CONSTRAINT trackly_friendship_not_self CHECK (user_id <> friend_id)
 → No self-friendship.


Index: idx_trackly_friendship_user_id on (user_id)


Index: idx_trackly_friendship_friend_id on (friend_id)


Feed definition (backend logic)
For logged-in user U:
Get friend_ids from trackly_friendship where user_id = U.id.


Fetch posts from trackly_post where user_id IN friend_ids.


Optionally filter by post_date = CURRENT_DATE.


Join with trackly_like to get like counts and “liked_by_me”.


2. Django models.py
(Models.py tells Django what the tables look like and how they relate, so the backend can query the database properly.)

from django.conf import settings
from django.db import models
from django.utils import timezone

User = settings.AUTH_USER_MODEL


class Post(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='posts',
    )
    song_title = models.CharField(max_length=255)
    artist_name = models.CharField(max_length=255)
    spotify_url = models.URLField(max_length=500, blank=True, null=True)
    caption = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    post_date = models.DateField(default=timezone.now, db_index=True)

    class Meta:
        db_table = 'trackly_post'
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'post_date'],
                name='trackly_post_uniq_per_user_per_day',
            )
        ]

    def __str__(self):
        return f'{self.user} - {self.song_title} ({self.post_date})'


class Like(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='likes',
    )
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='likes',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'trackly_like'
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'post'],
                name='trackly_like_uniq_per_user_per_post',
            )
        ]

    def __str__(self):
        return f'{self.user} likes {self.post}'


class Friendship(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='friendships',
    )
    friend = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='friend_of',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'trackly_friendship'
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'friend'],
                name='trackly_friendship_uniq_pair',
            )
        ]

    def __str__(self):
        return f'{self.user} -> {self.friend}'

3. Django ORM Examples: Feed / Post / Like / Unlike
3.1 Get Today's Feed
from django.utils import timezone
from django.db.models import Count, Exists, OuterRef

def get_today_feed_for_user(user):
    today = timezone.now().date()

    friend_ids = Friendship.objects.filter(
        user=user
    ).values('friend')

    liked_subquery = Like.objects.filter(
        user=user,
        post=OuterRef('pk'),
    )

    queryset = (
        Post.objects
        .filter(user_id__in=friend_ids, post_date=today)
        .annotate(
            likes_count=Count('likes'),
            liked_by_me=Exists(liked_subquery),
        )
        .select_related('user')
        .order_by('-created_at')
    )
    return queryset

3.2 Posting (One song per day; violating this rule will throw an IntegrityError)
from django.db import IntegrityError

def create_daily_post(user, song_title, artist_name, spotify_url=None, caption=''):
    try:
        post = Post.objects.create(
            user=user,
            song_title=song_title,
            artist_name=artist_name,
            spotify_url=spotify_url,
            caption=caption,
        )
        return post, None
    except IntegrityError:
        return None, "User has already posted today."

3.3 Like / Unlike
def like_post(user, post):
    like, created = Like.objects.get_or_create(user=user, post=post)
    return created  # True means a new like was created


def unlike_post(user, post):
    deleted, _ = Like.objects.filter(user=user, post=post).delete()
    return deleted > 0

4. Testing Data
4.1 Test Login Accounts
Username
Password
Notes
student_login
123456
Main test user: has friends & likes posts
alice
123456
Has her own post, is a friend of student_login
bob
123456
Has his own post, is a friend of student_login
charlie
123456
Has a post, but NOT a friend of student_login


What each test user can see
Logged-in User
Should see posts from
student_login
alice, bob
alice
alice only
bob
bob only
charlie
charlie only


4.2 Test Scenarios
Scenario to Test
Expected Result
Login as student_login and fetch feed
Should see 2 posts: Alice & Bob; 
should NOT see Charlie's post
5. Frontend CSRF flow (examples)

For cross-site requests the frontend should fetch a CSRF cookie first and then include the token in `X-CSRFToken` on state-changing requests. Example (browser / fetch):

```js
// 1) obtain csrftoken cookie
await fetch('https://your-backend.example.com/csrf/', { credentials: 'include' });

// 2) read cookie (simple helper) and include it
function getCookie(name) {
    const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return v ? v.pop() : '';
}
const csrftoken = getCookie('csrftoken');

// 3) make POST with credentials and header
await fetch('https://your-backend.example.com/posts/', {
    method: 'POST',
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken,
    },
    body: JSON.stringify({ song_title: '...', artist_name: '...' }),
});
```

Notes:
- Ensure frontend runs on HTTPS in production.
- Ensure `fetch` uses `credentials: 'include'` so the session cookie is sent.
- In production `SESSION_COOKIE_SAMESITE='None'` and `SESSION_COOKIE_SECURE=True` are required.

Login as alice and fetch feed
Should see only Alice’s own post (no posts from Bob/Charlie)
Login as charlie and fetch feed
Should see only Charlie's own post
student_login tries to like Alice’s post again
Should fail because like is unique per user per post
Each user tries to create a second post on the same day
Should fail because 1 post per user per day is enforced
Friendship visibility
Only mutual friendships show in feed (Alice/Bob ↔ student_login)



