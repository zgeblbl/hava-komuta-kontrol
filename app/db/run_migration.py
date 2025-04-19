from migrations import migrate_database

if __name__ == "__main__":
    print("Starting database migration...")
    migrate_database()
    print("Migration process completed.") 