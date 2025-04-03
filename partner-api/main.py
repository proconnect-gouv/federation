import asyncio
import os
import secrets
from contextlib import asynccontextmanager
from datetime import datetime
from typing import List, Literal, Optional

from bson import ObjectId
from fastapi import FastAPI, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, ConfigDict, HttpUrl, constr

from middleware import encode_response, verify_signature
import logging

# All config in one place
CONFIG = {
    "mongodb_url": os.getenv("MONGODB_URL"),
    "mongodb_username": os.getenv("MONGODB_USERNAME"),
    "mongodb_password": os.getenv("MONGODB_PASSWORD"),
    "mongodb_certificate_filepath": os.getenv("MONGODB_CERTIFICATE_FILEPATH"),
    "mongodb_ca_filepath": os.getenv("MONGODB_CA_FILEPATH"),
    "api_secret": os.getenv("API_SECRET"),  # shared secret
    "max_timestamp_diff": 300,  # 5 minutes
}

logger = logging.getLogger("gunicorn.error")

logger.info(CONFIG["mongodb_url"])
logger.info(CONFIG["mongodb_username"])
logger.info(CONFIG["mongodb_password"][:3])
logger.info(CONFIG["mongodb_certificate_filepath"])
logger.info(CONFIG["mongodb_ca_filepath"])
logger.info(CONFIG["api_secret"][:3])
logger.info(CONFIG["max_timestamp_diff"])

class OidcClient(BaseModel):
    model_config = ConfigDict(extra="forbid")

    # These are the only fields that can be set through the API
    name: constr(min_length=1, max_length=200) | None = None
    redirect_uris: List[str] | None = None
    post_logout_redirect_uris: List[str] | None = None
    id_token_signed_response_alg: Literal["RS256", "ES256", "HS256"] | None = None
    userinfo_signed_response_alg: Literal["RS256", "ES256", "HS256"] | None = None
    active: bool | None = None


def validate_objectid(_id: str) -> ObjectId:
    try:
        oid = ObjectId(_id)
    except:
        raise HTTPException(status_code=422, detail="Invalid ObjectId") from None
    return oid


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    app.mongodb_client = AsyncIOMotorClient(
        CONFIG["mongodb_url"],
        username=CONFIG["mongodb_username"],
        password=CONFIG["mongodb_password"],
        tls=True,
        tlsCAFile=CONFIG["mongodb_ca_filepath"],
        tlsCertificateKeyFile=CONFIG["mongodb_certificate_filepath"],
    )

    app.db = app.mongodb_client.get_default_database()
    app.collection = app.db.get_collection("client")
    ping_response = {"ok": 0}
    # Wait for database to be ready
    for i in range(10):
        try:
            logger.info(i)
            ping_response = await app.db.command("ping")
            logger.info(ping_response)
            break
        except Exception as e:  # pragma: no cover
            logger.info(e)
            await asyncio.sleep(1)
    if int(ping_response["ok"]) != 1:  # pragma: no cover
        raise Exception("Problem connecting to database.")
    logger.info("yield")
    yield
    # Shutdown
    app.mongodb_client.close()


app = FastAPI(lifespan=lifespan)

# Middleware to verify signature on /api/*
app.middleware("http")(lambda request, call_next: verify_signature(request, call_next, CONFIG))


@app.get("/healthz")
async def healthz():
    ping_response = await app.db.command("ping")
    logger.info(ping_response)
    if int(ping_response["ok"]) != 1:  # pragma: no cover
        raise HTTPException(status_code=500, detail="Database connection failed")
    return "ok"


@app.get("/api/oidc_clients")
@encode_response
async def list_oidc_clients(request: Request):
    cursor = app.collection.find({"email": request.state.email})
    elts = await cursor.to_list(None)
    return elts


@app.post("/api/oidc_clients")
@encode_response
async def create_oidc_client(data: OidcClient, request: Request):
    d = data.model_dump(exclude_unset=True)
    d.update(
        {
            "email": request.state.email,
            "createdAt": datetime.now(),
            "updatedAt": datetime.now(),
            "updatedBy": "espace-partenaires",
            # TODO: fix these fields?
            "title": "Nouvelle application",
            "site": ["https://site.com"],
            # Generate IDs in correct format
            "key": secrets.token_hex(32),  # 64 hex chars
            "client_secret": secrets.token_hex(32),  # 64 hex chars
            "entityId": secrets.token_hex(32),  # 64 hex chars
            "credentialsFlow": False,
            "claims": ["amr"],
            "IPServerAddressesAndRanges": ["1.1.1.1"],
            "type": "public",
            "scopes": [
                "openid",
                "given_name",
                "usual_name",
                "email",
                "uid",
                "siren",
                "siret",
                "organizational_unit",
                "belonging_population",
                "phone",
                "chorusdt",
                "idp_id",
                "idp_acr",
                "custom",
            ],
            "jwks_uri": "",
        }
    )
    result = await app.collection.insert_one(d)
    if not result.acknowledged:  # pragma: no cover
        logger.info("create_oidc_client update error")
        raise HTTPException(status_code=500)
    return d


@app.get("/api/oidc_clients/{id}")
@encode_response
async def get_oidc_client(id: str, request: Request):
    oid = validate_objectid(id)
    if not (elt := await app.collection.find_one({"_id": oid, "email": request.state.email})):
        logger.info(f"get_oidc_client : {request.state.email}")
        raise HTTPException(status_code=404)
    return elt


@app.patch("/api/oidc_clients/{id}")
@encode_response
async def update_oidc_client(id: str, updates: OidcClient, request: Request):
    oid = validate_objectid(id)
    d = updates.model_dump(exclude_unset=True)
    d.update(
        {
            "updatedAt": datetime.now(),
            "updatedBy": "espace-partenaires",
        }
    )
    result = await app.collection.update_one(
        {"_id": oid, "email": request.state.email}, {"$set": d}
    )
    if not result.matched_count:
        logger.info(f"HTTP 404 update_oidc_client : {request.matched_count}")
        raise HTTPException(status_code=404)
    updated = await app.collection.find_one({"_id": oid})
    return updated
