from django.urls import path, include

try:
    urlpatterns = [
        path('', include('core.urls')),
    ]
except Exception as exc:
    # Log import-time errors clearly to stdout/stderr so Render logs show the traceback
    import sys, traceback
    print('Error importing core.urls during urlpatterns setup:', exc, file=sys.stderr)
    traceback.print_exc()
    raise
