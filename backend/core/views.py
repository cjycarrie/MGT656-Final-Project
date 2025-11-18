import json
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth import authenticate, login as auth_login
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt
import jwt
from datetime import datetime, timedelta
from django.contrib.auth import get_user_model
from django.conf import settings
from django.http import FileResponse, HttpResponseNotFound
import mimetypes
from pathlib import Path

from .models import Post, Like, Friendship
from django.db.models import Count, Exists, OuterRef
from django.utils import timezone


def ok(request):
    return HttpResponse('OK')


def login_view(request):
    """Simple POST login that authenticates against Django's auth system.

    Accepts JSON {"username": "...", "password": "..."} or standard
    form-encoded POST (username=...&password=...). Returns 200 with
    {"status": "OK"} when credentials are correct, else 401.
    """
    if request.method != 'POST':
        return JsonResponse({'detail': 'method not allowed'}, status=405)

    data = None

    # Try JSON first
    content_type = request.META.get('CONTENT_TYPE', '') or ''
    if 'application/json' in content_type:
        try:
            data = json.loads(request.body.decode('utf-8') or '{}')
        except Exception:
            return JsonResponse({'detail': 'bad request: invalid json'}, status=400)
    else:
        # Fallback to form-encoded data (request.POST) or try JSON anyway
        if request.POST:
            # request.POST is a QueryDict; convert to normal dict
            data = {k: v for k, v in request.POST.items()}
        else:
            # try to parse body as json even if content-type missing
            try:
                data = json.loads(request.body.decode('utf-8') or '{}')
            except Exception:
                data = None

    if not data:
        return JsonResponse({'detail': 'bad request: missing JSON or form body'}, status=400)

    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return JsonResponse({'detail': 'bad request: username and password required'}, status=400)

    user = authenticate(username=username, password=password)
    if user is not None:
        # Create a session for the authenticated user
        auth_login(request, user)
        return JsonResponse({'status': 'OK'})
    return JsonResponse({'status': 'invalid'}, status=401)


@csrf_exempt
def friends_posts(request):
    """Return posts from friends. Optional query: post_date=YYYY-MM-DD, page, page_size"""
    user = getattr(request, 'user', None)
    if not user or getattr(user, 'is_anonymous', True):
        return JsonResponse({'detail': 'authentication required'}, status=401)
    date_param = request.GET.get('post_date')
    filter_date = None
    if date_param:
        try:
            from datetime import date
            filter_date = date.fromisoformat(date_param)
        except Exception:
            filter_date = None

    friend_ids = Friendship.objects.filter(user=user).values_list('friend', flat=True)

    liked_subquery = Like.objects.filter(user=user, post=OuterRef('pk'))

    qs = Post.objects.filter(user_id__in=friend_ids)
    if filter_date:
        qs = qs.filter(post_date=filter_date)

    qs = qs.annotate(
        likes_count=Count('likes'),
        liked_by_me=Exists(liked_subquery),
    ).select_related('user').order_by('-created_at')

    page = max(1, int(request.GET.get('page', 1)))
    page_size = min(100, int(request.GET.get('page_size', 20)))
    start = (page - 1) * page_size
    end = start + page_size

    results = []
    for p in qs[start:end]:
        results.append({
            'id': p.id,
            'author_id': p.user.id,
            'author_username': getattr(p.user, 'username', None),
            'song_title': p.song_title,
            'artist_name': p.artist_name,
            'spotify_url': p.spotify_url,
            'caption': p.caption,
            'created_at': p.created_at.isoformat(),
            'post_date': p.post_date.isoformat(),
            'likes_count': p.likes_count,
            'liked_by_me': bool(p.liked_by_me),
        })

    return JsonResponse({'results': results, 'page': page, 'page_size': page_size})


@csrf_exempt
def create_post(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'method not allowed'}, status=405)
    user = getattr(request, 'user', None)
    if not user or getattr(user, 'is_anonymous', True):
        return JsonResponse({'detail': 'authentication required'}, status=401)
    try:
        data = json.loads(request.body.decode('utf-8') or '{}')
    except Exception:
        data = request.POST

    song_title = data.get('song_title')
    artist_name = data.get('artist_name')
    spotify_url = data.get('spotify_url')
    caption = data.get('caption', '')

    if not song_title or not artist_name:
        return JsonResponse({'detail': 'song_title and artist_name required'}, status=400)
    try:
        post = Post.objects.create(
            user=request.user,
            song_title=song_title,
            artist_name=artist_name,
            spotify_url=spotify_url,
            caption=caption,
        )
        return JsonResponse({'id': post.id, 'post_date': post.post_date.isoformat()})
    except IntegrityError:
        return JsonResponse({'detail': 'User has already posted today.'}, status=400)


@csrf_exempt
def like_post(request, post_id):
    if request.method != 'POST':
        return JsonResponse({'detail': 'method not allowed'}, status=405)
    user = getattr(request, 'user', None)
    if not user or getattr(user, 'is_anonymous', True):
        return JsonResponse({'detail': 'authentication required'}, status=401)
    post = get_object_or_404(Post, id=post_id)
    action = None
    try:
        data = json.loads(request.body.decode('utf-8') or '{}')
        action = data.get('action')
    except Exception:
        action = request.POST.get('action')

    if action == 'unlike':
        Like.objects.filter(user=request.user, post=post).delete()
        liked = False
    else:
        like, created = Like.objects.get_or_create(user=request.user, post=post)
        liked = True

    likes_count = Like.objects.filter(post=post).count()
    return JsonResponse({'post_id': post.id, 'likes_count': likes_count, 'liked': liked})


@ensure_csrf_cookie
def csrf(request):
    """Lightweight endpoint that ensures a CSRF cookie is set.

    Frontend should call this with `credentials: 'include'` to obtain the
    `csrftoken` cookie, then include the token in `X-CSRFToken` for POSTs.
    """
    return HttpResponse(status=204)


def csrf_token(request):
    """Return CSRF token in JSON. Frontend should call with `credentials: 'include'`.

    This is a helper for cross-origin frontends that cannot read the cookie directly.
    """
    token = get_token(request)
    return JsonResponse({'csrftoken': token})


@csrf_exempt
def token_login(request):
    """Token-based login: accepts JSON {username, password} and returns JWT.

    This endpoint is CSRF-exempt because it is intended for use by cross-origin
    frontends that will authenticate using the returned token in the
    Authorization header for subsequent requests.
    """
    if request.method != 'POST':
        return JsonResponse({'detail': 'method not allowed'}, status=405)

    try:
        payload = json.loads(request.body.decode('utf-8') or '{}')
    except Exception:
        return JsonResponse({'detail': 'invalid json'}, status=400)

    username = payload.get('username')
    password = payload.get('password')
    if not username or not password:
        return JsonResponse({'detail': 'username and password required'}, status=400)

    user = authenticate(username=username, password=password)
    if user is None:
        return JsonResponse({'detail': 'invalid credentials'}, status=401)

    # Build token
    now = datetime.utcnow()
    exp = now + timedelta(days=14)
    # Set iat slightly in the past to avoid "token not yet valid (iat)" when
    # there is minor clock skew between services. Use a larger backdate to be
    # tolerant of small clock differences between hosts.
    issued_at = now - timedelta(seconds=10)
    token_payload = {
        'user_id': user.id,
        'exp': int(exp.timestamp()),
        'iat': int(issued_at.timestamp()),
    }
    token = jwt.encode(token_payload, settings.SECRET_KEY, algorithm='HS256')
    return JsonResponse({'token': token, 'user': {'id': user.id, 'username': user.username}})


def serve_frontend(request, path=''):
    """Serve files from the repository's `frontend/` folder under `/site/`.

    This is a minimal static file server intended for simple deployments where
    you want the backend and frontend on the same origin. It is not a full
    production CDN but works for small apps and for Render deployments.
    """
    # Compute frontend directory: workspace root /frontend
    backend_dir = Path(__file__).resolve().parent.parent
    frontend_dir = backend_dir.parent / 'frontend'

    # Default to index.html when no path provided or path is a directory
    if not path or path.endswith('/'):
        path = 'index.html'

    file_path = frontend_dir / path
    if not file_path.exists() or not file_path.is_file():
        return HttpResponseNotFound('Not found')

    content_type, _ = mimetypes.guess_type(str(file_path))
    return FileResponse(open(file_path, 'rb'), content_type=content_type or 'application/octet-stream')


@csrf_exempt
def token_debug(request):
    """Temporary debug endpoint: show whether Authorization header arrived
    and whether the token can be decoded by the server. This is safe for
    debugging because it does NOT echo back the token itself; it only
    returns whether a token was present and a short decode result.
    """
    auth = request.META.get('HTTP_AUTHORIZATION', '')
    has_auth = bool(auth and auth.lower().startswith('bearer '))
    result = {'auth_header': has_auth}
    if not has_auth:
        return JsonResponse(result)

    token = auth.split(None, 1)[1].strip()
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'], leeway=60)
        # Only include small, non-sensitive pieces of payload
        result['token_decode'] = 'ok'
        result['user_id'] = payload.get('user_id')
    except Exception as exc:
        result['token_decode'] = 'error'
        result['token_error'] = str(exc)[:512]

    return JsonResponse(result)

