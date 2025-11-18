import jwt
import json
import logging
from django.conf import settings
from django.contrib.auth import get_user_model

logger = logging.getLogger('request_logger')

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
        has_auth = bool(auth and auth.lower().startswith('bearer '))
        token_decode = 'not_attempted'
        user_found = None
        try:
            if has_auth:
                # Do not log the token itself. Only log presence and outcomes.
                token = auth.split(None, 1)[1].strip()
                try:
                    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                    token_decode = 'ok'
                    user_id = payload.get('user_id')
                    if user_id:
                        User = get_user_model()
                        try:
                            user = User.objects.get(pk=user_id)
                            request.user = user
                            try:
                                request._cached_user = user
                            except Exception:
                                pass
                            user_found = user_id
                        except User.DoesNotExist:
                            user_found = None
                except Exception:
                    token_decode = 'error'
        finally:
            # Emit a short, structured log for debugging. This avoids exposing
            # secrets while showing whether the header was present and if a
            # matching user was found.
            try:
                logger.info(json.dumps({
                    'path': getattr(request, 'path', None),
                    'auth_header': has_auth,
                    'token_decode': token_decode,
                    'user_found': user_found,
                }))
            except Exception:
                pass

        response = self.get_response(request)
        return response
