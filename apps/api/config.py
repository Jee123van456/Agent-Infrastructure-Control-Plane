import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "TylerDeck AI Agent Observability API"
    API_V1_PREFIX: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "tylerdeck_super_secret_jwt_key_2026_prod")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Default to PostgreSQL database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://tylerdeck:tylerdeckpass@postgres:5432/tylerdeckdb")

settings = Settings()
