import hashlib
import hmac
import json
import re
import time
from functools import wraps
from typing import Callable, Dict

from bson import ObjectId
from fastapi import HTTPException, Request
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse


def encode_response(func: Callable):
    """Decorator to encode MongoDB responses as JSON"""

    @wraps(func)
    async def wrapper(*args, **kwargs):
        response = await func(*args, **kwargs)
        return jsonable_encoder(response, custom_encoder={ObjectId: str})

    return wrapper


async def verify_signature(request: Request, call_next, config: Dict):
    """Middleware to verify request signatures"""

    if not request.url.path.startswith("/api"):
        return await call_next(request)

    signature = request.headers.get("X-Signature")
    timestamp = request.headers.get("X-Timestamp")
    email = request.query_params.get("email")

    if not all([signature, timestamp, email]):
        return JSONResponse(status_code=401, content={"detail": "Missing authentication headers"})

    # Verify email format
    if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", email):
        return JSONResponse(status_code=422, content={"detail": "Invalid email"})

    # Verify timestamp freshness
    ts = int(timestamp)
    now = int(time.time())
    if abs(now - ts) > config["max_timestamp_diff"]:
        return JSONResponse(status_code=401, content={"detail": "Timestamp expired"})

    # Build message exactly as client does
    message = f"{timestamp}:{request.method}:{request.url.path + '?' + request.url.query}"

    # Add raw request body if present
    if request.method in ["POST", "PATCH", "PUT"]:
        body = await request.body()
        if body:
            message += f":{body.decode()}"

    expected = hmac.new(
        config["api_secret"].encode(), message.encode(), hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(signature, expected):
        return JSONResponse(status_code=401, content={"detail": "Invalid signature"})

    # Add verified email to request state
    request.state.email = email

    return await call_next(request)
