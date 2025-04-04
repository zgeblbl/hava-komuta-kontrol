from app.schemas.jamming import JammingZone

jamming_zones = [
    JammingZone(id=1, latitude=39.95, longitude=32.85, radius_km=10.0, description="Test bölgesi"),
]

def get_all_zones():
    return jamming_zones

def add_zone(zone: JammingZone):
    jamming_zones.append(zone)
    return zone

def delete_zone(zone_id: int):
    global jamming_zones
    before = len(jamming_zones)
    jamming_zones = [z for z in jamming_zones if z.id != zone_id]
    return len(jamming_zones) < before
