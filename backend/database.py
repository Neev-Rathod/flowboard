import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

# Uses Postgres if deployed via docker-compose (DATABASE_URL provided)
# Falls back to local SQLite database if no environment variable is found.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./local.db")

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
