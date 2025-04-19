from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.migrations import migrate_database
from app.routers import aircraft, auth, airport

app = FastAPI(title="Hava Komuta Kontrol Sistemi")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(aircraft.router, prefix="/api/aircrafts", tags=["aircraft"])
app.include_router(airport.router, prefix="/api/airports", tags=["airports"])

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    migrate_database()

@app.get("/")
async def root():
    return {"message": "Hava Komuta Kontrol Sistemi API"}
