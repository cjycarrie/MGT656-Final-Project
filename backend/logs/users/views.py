from django.http import JsonResponse
from django.contrib.auth import authenticate

def login_view(request):
    if request.method == "POST":
        import json
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")
        user = authenticate(username=username, password=password)
        if user:
            return JsonResponse({"success": True})
        else:
            return JsonResponse({"success": False, "error": "Invalid credentials"})
    return JsonResponse({"error": "POST request required"})
