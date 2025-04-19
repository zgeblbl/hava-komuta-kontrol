from sqlalchemy import text
from app.database import engine, SessionLocal
from app.db.base import Base
from app.models import Aircraft, PositionLog, Airport, JammingZone, User, MissileLaunch, FlightScenario, EventLog

def migrate_database():
    """
    Migrate the database schema to the new version without PostGIS dependencies.
    This script handles the transition from Geography columns to regular Float columns.
    """
    try:
        # Create a new session
        db = SessionLocal()
        
        # 1. Create tables in the correct order
        print("Creating tables in order...")
        
        # First create tables without foreign key dependencies
        print("Creating base tables...")
        Airport.__table__.create(engine, checkfirst=True)
        User.__table__.create(engine, checkfirst=True)
        
        # Then create tables that depend on them
        print("Creating dependent tables...")
        Aircraft.__table__.create(engine, checkfirst=True)
        PositionLog.__table__.create(engine, checkfirst=True)
        MissileLaunch.__table__.create(engine, checkfirst=True)
        JammingZone.__table__.create(engine, checkfirst=True)
        FlightScenario.__table__.create(engine, checkfirst=True)
        EventLog.__table__.create(engine, checkfirst=True)
        
        # 2. Check if we need to migrate data
        try:
            # Check if the old Geography columns exist
            result = db.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'aircrafts' 
                AND column_name = 'location'
            """))
            has_old_columns = result.scalar() is not None
            
            if has_old_columns:
                print("Found old schema with PostGIS columns. Starting migration...")
                
                # 3. Create temporary columns for the new data
                print("Creating temporary columns...")
                db.execute(text("""
                    ALTER TABLE aircrafts 
                    ADD COLUMN IF NOT EXISTS temp_latitude FLOAT,
                    ADD COLUMN IF NOT EXISTS temp_longitude FLOAT
                """))
                
                # 4. Extract coordinates from Geography columns
                print("Extracting coordinates from Geography columns...")
                db.execute(text("""
                    UPDATE aircrafts 
                    SET temp_latitude = ST_Y(location::geometry),
                        temp_longitude = ST_X(location::geometry)
                    WHERE location IS NOT NULL
                """))
                
                # 5. Drop old Geography columns
                print("Dropping old Geography columns...")
                db.execute(text("""
                    ALTER TABLE aircrafts 
                    DROP COLUMN IF EXISTS location,
                    DROP COLUMN IF EXISTS departure_point,
                    DROP COLUMN IF EXISTS destination_point
                """))
                
                # 6. Rename temporary columns to final names
                print("Renaming temporary columns...")
                db.execute(text("""
                    ALTER TABLE aircrafts 
                    RENAME COLUMN temp_latitude TO latitude;
                    ALTER TABLE aircrafts 
                    RENAME COLUMN temp_longitude TO longitude
                """))
                
                # 7. Add new foreign key columns for airports
                print("Adding airport relationship columns...")
                db.execute(text("""
                    ALTER TABLE aircrafts 
                    ADD COLUMN IF NOT EXISTS departure_airport_id UUID,
                    ADD COLUMN IF NOT EXISTS destination_airport_id UUID
                """))
                
                # 8. Commit the changes
                db.commit()
                print("✅ Database migration completed successfully!")
            else:
                print("✅ Database schema is already up to date!")
                
        except Exception as e:
            db.rollback()
            print(f"❌ Error during migration: {str(e)}")
            raise e
            
    except Exception as e:
        print(f"❌ Error during migration: {str(e)}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    migrate_database() 