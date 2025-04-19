from app.schemas.aircraft import Aircraft
from app.utils.slerp import slerp
import time

start_time = time.time()

track_logs = {1: [], 2: []}

base_aircrafts = [
    Aircraft(
        id=1, latitude=39.9, longitude=32.85,
        target_latitude=40.0, target_longitude=33.0,
        altitude=10000, speed=850, heading=90
    ),
    Aircraft(
        id=2, latitude=40.1, longitude=32.9,
        target_latitude=39.8, target_longitude=32.6,
        altitude=12000, speed=900, heading=180
    ),
]

def get_all_aircrafts():
    now = time.time()
    progress = (now - start_time) % 60 / 60

    result = []
    for ac in base_aircrafts:
        lat, lon = slerp(ac.latitude, ac.longitude, ac.target_latitude, ac.target_longitude, progress)
        ac.latitude, ac.longitude = lat, lon

        if ac.id not in track_logs:
            track_logs[ac.id] = []
        track_logs[ac.id].append((round(lat, 6), round(lon, 6)))
        track_logs[ac.id] = track_logs[ac.id][-20:]
        ac.track = track_logs[ac.id]

        result.append(ac)
    return result

def get_aircraft_by_id(aircraft_id: int):
    all_aircrafts = get_all_aircrafts()
    return next((a for a in all_aircrafts if a.id == aircraft_id), None)

def remove_aircraft(aircraft_id: int):
    global base_aircrafts, track_logs
    before = len(base_aircrafts)
    base_aircrafts = [ac for ac in base_aircrafts if ac.id != aircraft_id]
    track_logs.pop(aircraft_id, None)
    return len(base_aircrafts) < before
