from sqlalchemy import text
from app.db.base import engine, Base
from app.models import User, Aircraft, PositionLog, MissileLaunch, JammingZone, FlightScenario, EventLog

def init_db():
    try:
        # Test the connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version();"))
            version = result.scalar()
            print(f"✅ Successfully connected to PostgreSQL. Version: {version}")

        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ All tables created successfully")

        return True

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise e

if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    print("Database initialization completed!") 