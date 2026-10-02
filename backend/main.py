from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import os
from pathlib import Path
import secrets
import sqlite3

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr, Field
import joblib
import numpy as np


app = FastAPI()
BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "users.db"
JWT_SECRET = os.getenv("JWT_SECRET", "change-this-development-secret")
JWT_ALGORITHM = "HS256"
TOKEN_LIFETIME = timedelta(hours=2)
bearer_scheme = HTTPBearer(auto_error=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rf_model = joblib.load(BASE_DIR / "models" / "random_forest_model.pkl")
xgb_model = joblib.load(BASE_DIR / "models" / "xgb_model.pkl")


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        columns = {
            row["name"] for row in connection.execute("PRAGMA table_info(users)")
        }
        if "full_name" not in columns:
            connection.execute(
                "ALTER TABLE users ADD COLUMN full_name TEXT NOT NULL DEFAULT ''"
            )
        if "email" not in columns:
            connection.execute(
                "ALTER TABLE users ADD COLUMN email TEXT NOT NULL DEFAULT ''"
            )


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 300_000)
    return f"{salt.hex()}${digest.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    salt_hex, digest_hex = stored_hash.split("$", maxsplit=1)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode(), bytes.fromhex(salt_hex), 300_000
    )
    return hmac.compare_digest(digest.hex(), digest_hex)


def create_access_token(username: str) -> str:
    expires_at = datetime.now(timezone.utc) + TOKEN_LIFETIME
    return jwt.encode(
        {"sub": username, "exp": expires_at}, JWT_SECRET, algorithm=JWT_ALGORITHM
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> str:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Login required to access predictions.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(
            credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM]
        )
        username = payload.get("sub")
        if not username:
            raise JWTError
    except JWTError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired login token.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from error

    with get_connection() as connection:
        user = connection.execute(
            "SELECT username FROM users WHERE username = ?", (username,)
        ).fetchone()
    if user is None:
        raise HTTPException(status_code=401, detail="User account not found.")
    return username


class LoginData(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8, max_length=128)


class RegisterData(LoginData):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PatientData(BaseModel):
    yellow_fingers: int
    anxiety: int
    peer_pressure: int
    chronic_disease: int
    fatigue: int
    allergy: int
    wheezing: int
    alcohol_consuming: int
    coughing: int
    swallowing_difficulty: int
    chest_pain: int


initialize_database()


@app.get("/")
def home():
    return {"message": "Lung Cancer Prediction API"}


@app.post("/auth/register", response_model=TokenResponse, status_code=201)
def register(data: RegisterData):
    username = data.username.strip()
    full_name = data.full_name.strip()
    email = str(data.email).lower()
    if len(username) < 3:
        raise HTTPException(
            status_code=422, detail="Username must have at least 3 characters."
        )
    if len(full_name) < 2:
        raise HTTPException(status_code=422, detail="Full name is required.")

    try:
        with get_connection() as connection:
            existing_email = connection.execute(
                "SELECT id FROM users WHERE email = ?", (email,)
            ).fetchone()
            if existing_email is not None:
                raise HTTPException(
                    status_code=409, detail="Email is already registered."
                )
            connection.execute(
                "INSERT INTO users (username, full_name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
                (
                    username,
                    full_name,
                    email,
                    hash_password(data.password),
                    datetime.now(timezone.utc).isoformat(),
                ),
            )
    except sqlite3.IntegrityError as error:
        raise HTTPException(
            status_code=409, detail="Username is already registered."
        ) from error

    return TokenResponse(access_token=create_access_token(username))


@app.post("/auth/login", response_model=TokenResponse)
def login(data: LoginData):
    with get_connection() as connection:
        user = connection.execute(
            "SELECT username, password_hash FROM users WHERE username = ?",
            (data.username.strip(),),
        ).fetchone()

    if user is None or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect username or password.")

    return TokenResponse(access_token=create_access_token(user["username"]))


@app.post("/predict")
def predict(data: PatientData, username: str = Depends(get_current_user)):
    features = np.array(
        [
            [
                data.yellow_fingers,
                data.anxiety,
                data.peer_pressure,
                data.chronic_disease,
                data.fatigue,
                data.allergy,
                data.wheezing,
                data.alcohol_consuming,
                data.coughing,
                data.swallowing_difficulty,
                data.chest_pain,
                data.anxiety * data.yellow_fingers,
            ]
        ]
    )

    rf_prediction = int(rf_model.predict(features)[0])
    xgb_prediction = int(xgb_model.predict(features)[0])
    rf_probability = float(rf_model.predict_proba(features)[0][1])
    xgb_probability = float(xgb_model.predict_proba(features)[0][1])

    return {
        "random_forest_prediction": rf_prediction,
        "random_forest_probability": rf_probability,
        "xboost_prediction": xgb_prediction,
        "xboost_probability": xgb_probability,
    }
