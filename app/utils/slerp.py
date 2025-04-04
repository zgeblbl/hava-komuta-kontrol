from math import sin, cos, sqrt, atan2, radians, degrees, acos

def slerp(lat1, lon1, lat2, lon2, fraction):
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    x1, y1, z1 = cos(lat1)*cos(lon1), cos(lat1)*sin(lon1), sin(lat1)
    x2, y2, z2 = cos(lat2)*cos(lon2), cos(lat2)*sin(lon2), sin(lat2)
    dot = x1*x2 + y1*y2 + z1*z2
    dot = min(1.0, max(-1.0, dot))
    theta = acos(dot)
    if theta == 0:
        return degrees(lat1), degrees(lon1)
    A = sin((1 - fraction) * theta) / sin(theta)
    B = sin(fraction * theta) / sin(theta)
    x = A*x1 + B*x2
    y = A*y1 + B*y2
    z = A*z1 + B*z2
    lat = atan2(z, sqrt(x**2 + y**2))
    lon = atan2(y, x)
    return degrees(lat), degrees(lon)
