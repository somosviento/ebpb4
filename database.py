from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from typing import Generator

from core.config import get_settings

settings = get_settings()

connect_args = {}
if settings.sqlalchemy_database_url.startswith("sqlite"):
    # Needed for SQLite when used with FastAPI multi-threading
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.sqlalchemy_database_url,
    echo=False,
    future=True,
    pool_pre_ping=True,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)

Base = declarative_base()


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
