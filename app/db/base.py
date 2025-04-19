from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
from app.core.config import settings
from sqlalchemy.orm import sessionmaker

# Create SQLAlchemy engine
engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)

# Create declarative base
Base = declarative_base()

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 