import jwt
from django.conf import settings
from django.contrib.auth import get_user_model

class TokenAuthMiddleware:
    """Middleware that checks for an Authorization: Bearer <token>
    header and, if present and valid, sets `request.user` to the token user.

    This allows views to rely on `request.user` whether authentication comes
    from session cookies or from a bearer token.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        auth = request.META.get('HTTP_AUTHORIZATION', '')
        if auth and auth.lower().startswith('bearer '):
            token = auth.split(None, 1)[1].strip()
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                user_id = payload.get('user_id')
                if user_id:
                    User = get_user_model()
                    try:
                        user = User.objects.get(pk=user_id)
                        # Set both request.user and the cached user used by
                        # AuthenticationMiddleware to avoid SimpleLazyObject
                        # wrappers causing ORM lookups to receive a lazy proxy.
                        request.user = user
                        try:
                            request._cached_user = user
                        except Exception:
                            pass
                    except User.DoesNotExist:
                        pass
            except Exception:
                # invalid token -> ignore and continue
                pass

        response = self.get_response(request)
        return response
