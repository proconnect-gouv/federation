import asyncio
import hashlib
import hmac
import json
import logging
import os
import sys
import time

import pytest
from asgi_lifespan import LifespanManager
from fastapi import Request
from httpx import ASGITransport, AsyncClient, Response

from main import CONFIG, app

# Protection against running tests on production database
if os.getenv("CANT_RUN_TESTS"):  # pragma: no cover
    logging.error("Skipping tests because CANT_RUN_TESTS is set to protect the database.")
    sys.exit(1)


@pytest.fixture(scope="function")
async def client():
    async with LifespanManager(app) as manager:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # Clear database before each test
            await app.collection.delete_many({})
            yield client
            # Clear database after each test
            await app.collection.delete_many({})


async def api_call(
    client,
    method: str,
    path: str,
    json_data: dict = None,
    override_signature: str = None,
    override_timestamp: str = None,
) -> Response:
    """Make an authenticated API call"""
    # Generate timestamp and signature
    timestamp = override_timestamp or str(int(time.time()))

    # Build message exactly as server expects
    message = f"{timestamp}:{method}:{path}"

    kwargs = {
        "headers": {
            "X-Timestamp": timestamp,
        }
    }

    # Encode body once to use in both signature and request
    body = json.dumps(json_data).encode() if json_data else None
    if method in ["POST", "PATCH", "PUT"] and body:
        message += f":{body.decode()}"
        kwargs["content"] = body
        kwargs["headers"]["Content-Type"] = "application/json"

    # Use override_signature if provided, otherwise generate one
    kwargs["headers"]["X-Signature"] = (
        override_signature
        or hmac.new(CONFIG["api_secret"].encode(), message.encode(), hashlib.sha256).hexdigest()
    )

    return await getattr(client, method.lower())(path, **kwargs)


@pytest.mark.asyncio
async def test_missing_auth(client):
    response = await client.get("/")
    assert response.status_code == 404

    response = await client.get("/xyz")
    assert response.status_code == 404

    response = await client.get("/healthz")
    assert response.status_code == 200

    response = await client.get("/api/oidc_clients?email=test@example.com")
    assert response.status_code == 401
    assert response.json()["detail"] == "Missing authentication headers"

    # Call without email parameter
    response = await api_call(client, "GET", "/api/oidc_clients")
    assert response.status_code == 401
    assert response.json()["detail"] == "Missing authentication headers"


@pytest.mark.asyncio
async def test_invalid_signatures(client):
    # Test GET /api/oidc_clients
    response = await api_call(
        client, "GET", "/api/oidc_clients?email=test@example.com", override_signature="invalid"
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid signature"

    # Test POST /api/oidc_clients
    app_data = {"name": "Test App"}
    response = await api_call(
        client,
        "POST",
        "/api/oidc_clients?email=test@example.com",
        json_data=app_data,
        override_signature="invalid",
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid signature"

    # First create a valid app for GET and PATCH tests
    create_response = await api_call(
        client, "POST", "/api/oidc_clients?email=test@example.com", json_data=app_data
    )
    assert create_response.status_code == 200
    app_id = create_response.json()["_id"]

    # Test GET /api/oidc_clients/{id}
    response = await api_call(
        client,
        "GET",
        f"/api/oidc_clients/{app_id}?email=test@example.com",
        override_signature="invalid",
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid signature"

    # Test PATCH /api/oidc_clients/{id}
    updates = {"name": "Updated"}
    response = await api_call(
        client,
        "PATCH",
        f"/api/oidc_clients/{app_id}?email=test@example.com",
        json_data=updates,
        override_signature="invalid",
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid signature"


@pytest.mark.asyncio
async def test_invalid_timestamp(client):
    # Test past timestamp
    old_timestamp = str(int(time.time()) - 600)  # 10 minutes ago
    response = await api_call(
        client, "GET", "/api/oidc_clients?email=test@example.com", override_timestamp=old_timestamp
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Timestamp expired"

    # Test future timestamp
    future_timestamp = str(int(time.time()) + 600)  # 10 minutes in future
    response = await api_call(
        client,
        "GET",
        "/api/oidc_clients?email=test@example.com",
        override_timestamp=future_timestamp,
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Timestamp expired"


@pytest.mark.asyncio
async def test_list_oidc_clients(client):
    response = await api_call(client, "GET", "/api/oidc_clients?email=test@example.com")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_404s(client):
    response = await api_call(client, "GET", "/api/oidc_clients/1234567890?email=test@example.com")
    assert response.status_code == 422

    response = await api_call(client, "GET", "/?email=test@example.com")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_create_oidc_client(client):
    app_data = {"name": "Test App", "redirect_uris": ["https://example.com/callback"]}
    response = await api_call(
        client, "POST", "/api/oidc_clients?email=test@example.com", json_data=app_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == app_data["name"]
    assert data["email"] == "test@example.com"
    assert "_id" in data

    # Try to create with invalid email
    response = await api_call(
        client, "POST", "/api/oidc_clients?email=invalid", json_data=app_data
    )
    assert response.status_code == 422
    assert response.json()["detail"] == "Invalid email"

    response = await api_call(client, "POST", "/api/oidc_clients?email=", json_data=app_data)
    assert response.status_code == 401

    # Try to access app with {$ne:1} email
    response = await api_call(client, "GET", "/api/oidc_clients?email={$ne:1}", json_data=app_data)
    assert response.status_code == 422
    assert response.json()["detail"] == "Invalid email"


@pytest.mark.asyncio
async def test_update_fields_whitelist(client):
    # First create an app with non-whitelisted field
    app_data = {
        "name": "Test App",
        "not_allowed": "value",
        "redirect_uris": ["https://example.com/callback"],
        "another_field": 123,
    }
    create_response = await api_call(
        client, "POST", "/api/oidc_clients?email=test@example.com", json_data=app_data
    )
    assert create_response.status_code == 422

    # Create app with valid fields
    valid_data = {"name": "Test App", "redirect_uris": ["https://example.com/callback"]}
    create_response = await api_call(
        client, "POST", "/api/oidc_clients?email=test@example.com", json_data=valid_data
    )
    assert create_response.status_code == 200
    created = create_response.json()
    assert created["name"] == valid_data["name"]
    assert created["redirect_uris"] == valid_data["redirect_uris"]
    app_id = created["_id"]

    # Try to update with non-whitelisted fields
    updates = {
        "name": "Updated App",
        "not_allowed": "value",
        "redirect_uris": ["https://updated.com/callback"],
        "random_field": True,
    }
    response = await api_call(
        client, "PATCH", f"/api/oidc_clients/{app_id}?email=test@example.com", json_data=updates
    )
    assert response.status_code == 422

    # Try to update the email of an app (forbidden for now)
    updates = {"email": "other@example.com"}
    response = await api_call(
        client, "PATCH", f"/api/oidc_clients/{app_id}?email=test@example.com", json_data=updates
    )
    assert response.status_code == 422

    # Cannot create an app with a different email
    valid_data = {"name": "Test App", "email": "other@example.com"}
    create_response = await api_call(
        client, "POST", "/api/oidc_clients?email=test@example.com", json_data=valid_data
    )
    assert create_response.status_code == 422

    # Update with valid fields
    valid_updates = {"name": "Updated App", "redirect_uris": ["https://updated.com/callback"]}
    response = await api_call(
        client,
        "PATCH",
        f"/api/oidc_clients/{app_id}?email=test@example.com",
        json_data=valid_updates,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == valid_updates["name"]
    assert data["redirect_uris"] == valid_updates["redirect_uris"]


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "field,invalid_value",
    [
        ("name", 12),
        ("name", ""),
        ("redirect_uris", "https://updated.com/callback"),
        ("id_token_signed_response_alg", "unknown_algo"),
        ("active", "not_a_bool"),
        ("unknown_field", "1"),
        ("_id", "1"),
        ("id", "1"),
    ],
)
async def test_update_fields_type_validation(client, field, invalid_value):
    # Create initial app
    valid_data = {
        "name": "Test App",
        "redirect_uris": ["https://example.com/callback"],
        "id_token_signed_response_alg": "ES256",
        "active": True,
    }
    create_response = await api_call(
        client, "POST", "/api/oidc_clients?email=test@example.com", json_data=valid_data
    )
    assert create_response.status_code == 200
    app_id = create_response.json()["_id"]

    # Try to update with invalid type
    updates = {field: invalid_value}
    response = await api_call(
        client, "PATCH", f"/api/oidc_clients/{app_id}?email=test@example.com", json_data=updates
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_oidc_client_lifecycle(client):
    # Create an app
    app_data = {
        "name": "Test App",
        "redirect_uris": ["https://example.com/callback"],
        "id_token_signed_response_alg": "ES256",
    }
    create_response = await api_call(
        client, "POST", "/api/oidc_clients?email=test@example.com", json_data=app_data
    )
    assert create_response.status_code == 200
    created_app = create_response.json()
    assert created_app["name"] == app_data["name"]
    assert created_app["redirect_uris"] == app_data["redirect_uris"]
    assert created_app["email"] == "test@example.com"
    assert created_app["createdAt"] is not None
    assert created_app["updatedAt"] is not None
    assert created_app["updatedBy"] == "espace-partenaires"
    app_id = created_app["_id"]

    # Try to list apps with different email
    list_response = await api_call(client, "GET", "/api/oidc_clients?email=other@example.com")
    assert list_response.status_code == 200
    apps = list_response.json()
    assert len(apps) == 0

    # Try to get app directly with different email
    get_response = await api_call(
        client, "GET", f"/api/oidc_clients/{app_id}?email=other@example.com"
    )
    assert get_response.status_code == 404

    # Try to patch app with different email
    updates = {"name": "Different App"}
    patch_response = await api_call(
        client, "PATCH", f"/api/oidc_clients/{app_id}?email=other@example.com", json_data=updates
    )
    assert patch_response.status_code == 404

    # Try to patch app with invalid ID
    updates = {"name": "Different App"}
    patch_response = await api_call(
        client, "PATCH", f"/api/oidc_clients/1234567890?email=test@example.com", json_data=updates
    )
    assert patch_response.status_code == 422

    # Original email can still see it
    list_response = await api_call(client, "GET", "/api/oidc_clients?email=test@example.com")
    assert list_response.status_code == 200
    apps = list_response.json()
    assert len(apps) == 1
    assert apps[0]["_id"] == app_id
    assert apps[0]["name"] == app_data["name"]

    # Get app directly
    get_response = await api_call(
        client, "GET", f"/api/oidc_clients/{app_id}?email=test@example.com"
    )
    assert get_response.status_code == 200
    retrieved_app = get_response.json()
    assert retrieved_app["_id"] == app_id
    assert retrieved_app["name"] == app_data["name"]

    await asyncio.sleep(1)

    # Update app
    updates = {"name": "Updated App", "redirect_uris": ["https://updated.com/callback"]}
    patch_response = await api_call(
        client, "PATCH", f"/api/oidc_clients/{app_id}?email=test@example.com", json_data=updates
    )
    assert patch_response.status_code == 200
    updated_app = patch_response.json()
    assert updated_app["name"] == updates["name"]
    assert updated_app["redirect_uris"] == updates["redirect_uris"]

    # Get app again and verify update
    get_response = await api_call(
        client, "GET", f"/api/oidc_clients/{app_id}?email=test@example.com"
    )
    assert get_response.status_code == 200
    retrieved_app = get_response.json()
    assert retrieved_app["name"] == updates["name"]
    assert retrieved_app["redirect_uris"] == updates["redirect_uris"]
    assert retrieved_app["updatedAt"] is not None
    assert retrieved_app["updatedBy"] == "espace-partenaires"
    assert retrieved_app["updatedAt"] > created_app["updatedAt"]
    assert (
        retrieved_app["id_token_signed_response_alg"] == app_data["id_token_signed_response_alg"]
    )
