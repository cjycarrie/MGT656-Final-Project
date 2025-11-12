import time
import json
import logging

logger = logging.getLogger("request_logger")


class RequestLoggingMiddleware:
    """Middleware that logs each request as a JSON line to stdout.

    Logged fields: ts, ip, method, path, status, duration_ms, user_agent, user
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.time()
        response = self.get_response(request)
        duration = time.time() - start

        # Get client IP (respect X-Forwarded-For if present)
        xff = request.META.get("HTTP_X_FORWARDED_FOR")
        if xff:
            ip = xff.split(",")[0].strip()
        else:
            ip = request.META.get("REMOTE_ADDR")

        user = None
        try:
            if hasattr(request, "user") and request.user and request.user.is_authenticated:
                user = str(request.user)
        except Exception:
            user = "unknown"

        record = {
            "ts": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
            "ip": ip,
            "method": request.method,
            "path": request.get_full_path(),
            "status": getattr(response, "status_code", None),
            "duration_ms": int(duration * 1000),
            "user_agent": request.META.get("HTTP_USER_AGENT"),
            "user": user,
            "type": "request",
        }

        # Write a single JSON line to the configured logger (console handler)
        try:
            logger.info(json.dumps(record))
        except Exception:
            # Fallback to plain print if logging fails for any reason
            print(json.dumps(record))

        return response
