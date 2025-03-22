import numpy as np

def latlon_to_cartesian(lat, lon):
    lat, lon = np.radians(lat), np.radians(lon)
    x = np.cos(lat) * np.cos(lon)
    y = np.cos(lat) * np.sin(lon)
    z = np.sin(lat)
    return x, y, z

def cartesian_to_latlon(x, y, z):
    lat = np.arctan2(z, np.sqrt(x**2 + y**2))
    lon = np.arctan2(y, x)
    return np.degrees(lat), np.degrees(lon)

def great_circle_waypoints(start, end, num_waypoints=10):
    x1, y1, z1 = latlon_to_cartesian(*start)
    x2, y2, z2 = latlon_to_cartesian(*end)

    d = np.arccos(x1 * x2 + y1 * y2 + z1 * z2)

    waypoints = []
    for i in range(num_waypoints + 1):
        f = i / num_waypoints
        A = np.sin((1 - f) * d) / np.sin(d)
        B = np.sin(f * d) / np.sin(d)

        x = A * x1 + B * x2
        y = A * y1 + B * y2
        z = A * z1 + B * z2

        waypoints.append(cartesian_to_latlon(x, y, z))

    return waypoints

def update_position(lat, lon, velocity, heading, time_step):
    R = 6371  # in km- earth radius
    heading_rad = np.radians(heading)
    
    # changes computed here
    delta_x = (velocity * np.cos(heading_rad) * time_step) / R
    delta_y = (velocity * np.sin(heading_rad) * time_step) / R
    
    # update
    new_lat = lat + np.degrees(delta_y)
    new_lon = lon + np.degrees(delta_x / np.cos(np.radians(lat)))

    return new_lat, new_lon

start_point = (40.1281, 32.995)  # ESB - esenboğa ankara
end_point = (40.89833, 29.30917)    # SAW - sabiha gökçen ist

waypoints = great_circle_waypoints(start_point, end_point, num_waypoints=10)


# airplane speed generally around 880–926 km/h
velocity = 800 / 3.6  # speed 800km/h to m/s convert
time_step = 10  # can be changed

print("Flight Path:")

for i in range(len(waypoints) - 1):
    lat, lon = waypoints[i]
    next_lat, next_lon = waypoints[i + 1]

    delta_lon = np.radians(next_lon - lon)
    delta_phi = np.log(np.tan(np.radians(next_lat) / 2 + np.pi / 4) / np.tan(np.radians(lat) / 2 + np.pi / 4))
    track = np.degrees(np.arctan2(delta_lon, delta_phi))

    print(f"Waypoint {i + 1}: Lat {lat:.4f}, Lon {lon:.4f}, Track {track:.2f}°")

    for t in range(0, 60, time_step):  # every 10 secs
        lat, lon = update_position(lat, lon, velocity, track, time_step)
        print(f"  Time {t + 10}s: Lat {lat:.4f}, Lon {lon:.4f}, Speed {velocity * 3.6:.2f} km/h, Track {track:.2f}°")
