from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import aircraft, defense, jamming

app = FastAPI(title="Command Control API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # frontend URL'n varsa sadece onu yaz
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(aircraft.router, prefix="/aircraft", tags=["Aircraft"])
app.include_router(defense.router, prefix="/defense", tags=["Defense"])
app.include_router(jamming.router, prefix="/jamming", tags=["Jamming"])

@app.get("/")
def root():
    return {"message": "Command Control Backend is running 🚀"}
