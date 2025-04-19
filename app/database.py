from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from app.models import User, Aircraft, PositionLog, MissileLaunch, JammingZone, FlightScenario, EventLog

# Database connection URL
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:!Fani06!@localhost/command-control"

# Create engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for declarative models
Base = declarative_base()

def init_db():
    """Initialize the database and create tables"""
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")

    except Exception as e:
        print(f"❌ Error initializing database: {str(e)}")
        raise e

def get_db():
    """Dependency to get DB session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Run this if the file is executed directly
if __name__ == "__main__":
    init_db() 