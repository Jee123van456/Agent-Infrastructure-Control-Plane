import hashlib
import hmac
import secrets
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from apps.api.config import settings
from apps.api.database import get_db
from apps.api.models import User, APIKey, Project

security_bearer = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    """Hashes a password using PBKDF2-HMAC-SHA256."""
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100_000
    ).hex()
    return f"{salt}${pwd_hash}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against stored salt$hash."""
    try:
        salt, stored_hash = hashed_password.split('$')
        calc_hash = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt.encode('utf-8'),
            100_000
        ).hex()
        return hmac.compare_digest(calc_hash, stored_hash)
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generates a JWT access token for user sessions."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def generate_api_key() -> tuple[str, str, str]:
    """
    Generates a new secure API Key.
    Returns (raw_key, key_prefix, key_hash)
    Example raw key: 'td_live_9f8a3c4b1e5d6f7a8b9c0d1e2f3a4b5c'
    """
    random_part = secrets.token_hex(20)
    raw_key = f"td_live_{random_part}"
    key_prefix = raw_key[:12]
    key_hash = hashlib.sha256(raw_key.encode('utf-8')).hexdigest()
    return raw_key, key_prefix, key_hash

def hash_api_key(raw_key: str) -> str:
    """Computes SHA-256 hash of a raw API key."""
    return hashlib.sha256(raw_key.encode('utf-8')).hexdigest()

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: Session = Depends(get_db)
) -> User:
    """
    Authenticates user JWT token from Authorization Bearer header.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication credentials"
        )
    
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def verify_sdk_api_key(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: Session = Depends(get_db)
) -> Project:
    """
    Validates API key from SDK request (Bearer td_live_... or X-API-Key header).
    Returns the associated Project.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing TylerDeck API Key in Authorization header"
        )
    
    raw_key = credentials.credentials.strip()
    if not raw_key.startswith("td_live_"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key format. Must start with 'td_live_'"
        )

    key_hash = hash_api_key(raw_key)
    api_key_record = db.query(APIKey).filter(
        APIKey.key_hash == key_hash,
        APIKey.is_active == True
    ).first()

    if not api_key_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or revoked API Key"
        )

    # Update last_used_at timestamp
    api_key_record.last_used_at = datetime.utcnow()
    db.commit()

    return api_key_record.project
