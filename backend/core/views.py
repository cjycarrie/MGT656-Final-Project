import json
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate


def ok(request):
    return HttpResponse('OK')


@csrf_exempt
def login_view(request):
    """Simple POST login that authenticates against Django's auth system.

    Accepts JSON {"username": "...", "password": "..."} and returns 200 OK with
    {"status": "OK"} when credentials are correct, else 401.
    """
    if request.method != 'POST':
        return JsonResponse({'detail': 'method not allowed'}, status=405)

    try:
        data = json.loads(request.body.decode('utf-8'))
    except Exception:
        return JsonResponse({'detail': 'bad request'}, status=400)

    username = data.get('username')
    password = data.get('password')

    user = authenticate(username=username, password=password)
    if user is not None:
        return JsonResponse({'status': 'OK'})
    return JsonResponse({'status': 'invalid'}, status=401)
