import json
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate


def ok(request):
    return HttpResponse('OK')


@csrf_exempt
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
        return JsonResponse({'status': 'OK'})
    return JsonResponse({'status': 'invalid'}, status=401)
