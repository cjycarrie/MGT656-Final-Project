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
                        request.user = user
                    except User.DoesNotExist:
                        pass
            except Exception:
                # invalid token -> ignore and continue (request.user will be
                # whatever AuthenticationMiddleware sets later)
                pass

        response = self.get_response(request)
        return response
