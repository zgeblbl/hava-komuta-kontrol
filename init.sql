-- ================================
-- INIT.SQL - Komuta Kontrol Sistemi
-- ================================

-- DROP ORDER (önce ilişkili olanlar silinir)
DROP TABLE IF EXISTS user_sessions, logs, flights, flight_points,
aircraft_history, aircraft_state, aircrafts, hexagons,
airports, operator, station, unit, users, flight_plans, mission_types, weather_conditions CASCADE;

DROP TYPE IF EXISTS user_status, authority_level, flight_status, aircraft_status, weather_status, mission_status;

-- ENUM TYPES
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE authority_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'TOP');
CREATE TYPE flight_status AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'DELAYED');
CREATE TYPE aircraft_status AS ENUM ('ACTIVE', 'MAINTENANCE', 'GROUNDED', 'MISSION', 'STANDBY');
CREATE TYPE weather_status AS ENUM ('CLEAR', 'CLOUDY', 'RAINY', 'STORMY', 'SNOWY', 'FOG');
CREATE TYPE mission_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'ABORTED');

-- USERS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'user', 'supervisor', 'operator')) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- UNIT
CREATE TABLE unit (
    unit_id SERIAL PRIMARY KEY,
    unit_name VARCHAR(120) UNIQUE NOT NULL,
    unit_code VARCHAR(20) UNIQUE NOT NULL,
    parent_unit_id INT REFERENCES unit(unit_id),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- STATION
CREATE TABLE station (
    station_id SERIAL PRIMARY KEY,
    unit_id INT NOT NULL REFERENCES unit(unit_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    station_name VARCHAR(120) NOT NULL,
    station_code VARCHAR(20) UNIQUE NOT NULL,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    elevation DECIMAL(7,2),
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OPERATOR
CREATE TABLE operator (
    user_id SERIAL PRIMARY KEY,
    operator_code VARCHAR(20) UNIQUE NOT NULL,
    rank_id INT NOT NULL,
    first_name VARCHAR(60) NOT NULL,
    last_name VARCHAR(60) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    phone VARCHAR(20),
    status user_status NOT NULL DEFAULT 'ACTIVE',
    unit_id INT NOT NULL REFERENCES unit(unit_id),
    station_id INT NOT NULL REFERENCES station(station_id),
    authority_level authority_level NOT NULL,
    shift_start TIME,
    shift_end TIME,
    profile_photo_url TEXT,
    last_active TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- TRIGGER: operator.updated_at
CREATE OR REPLACE FUNCTION trg_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_operator_update
BEFORE UPDATE ON operator
FOR EACH ROW EXECUTE FUNCTION trg_set_timestamp();

-- AIRPORTS
CREATE TABLE airports (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    icao_code TEXT UNIQUE,
    iata_code TEXT UNIQUE,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    elevation DECIMAL(7,2),
    city TEXT,
    country TEXT,
    air_status_celcius INT,
    runway_length DECIMAL(9,2),
    is_military BOOLEAN DEFAULT FALSE,
    status BOOLEAN DEFAULT TRUE,
    weather_status weather_status,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MISSION TYPES
CREATE TABLE mission_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AIRCRAFTS
CREATE TABLE aircrafts (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    tail_number VARCHAR(20) UNIQUE NOT NULL,
    model TEXT NOT NULL,
    manufacturer TEXT,
    year_manufactured INT,
    owner TEXT,
    max_speed DECIMAL(9,2),
    cruise_speed DECIMAL(9,2),
    max_altitude DECIMAL(9,2),
    range DECIMAL(9,2),
    fuel_capacity DECIMAL(9,2),
    empty_weight DECIMAL(9,2),
    max_takeoff_weight DECIMAL(9,2),
    status aircraft_status DEFAULT 'STANDBY',
    current_location INT REFERENCES airports(id),
    maintenance_due_date DATE,
    last_maintenance_date DATE,
    flight_hours DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AIRCRAFT STATE
CREATE TABLE aircraft_state (
    id SERIAL PRIMARY KEY,
    aircraft_id INTEGER REFERENCES aircrafts(id) ON DELETE CASCADE,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    altitude DECIMAL(7,2),
    heading DECIMAL(5,2),
    ground_speed DECIMAL(7,2),
    vertical_speed DECIMAL(7,2),
    fuel_level DECIMAL(7,2),
    engine_status BOOLEAN,
    temperature DECIMAL(4,1),
    pressure DECIMAL(6,2),
    wind_speed DECIMAL(5,2),
    wind_direction DECIMAL(5,2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AIRCRAFT HISTORY
CREATE TABLE aircraft_history (
    id SERIAL PRIMARY KEY,
    aircraft_id INTEGER REFERENCES aircrafts(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    description TEXT,
    location INT REFERENCES airports(id),
    operator_id INTEGER REFERENCES operator(user_id),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- WEATHER CONDITIONS
CREATE TABLE weather_conditions (
    id SERIAL PRIMARY KEY,
    airport_id INTEGER REFERENCES airports(id),
    temperature DECIMAL(4,1),
    pressure DECIMAL(6,2),
    humidity DECIMAL(4,1),
    wind_speed DECIMAL(5,2),
    wind_direction DECIMAL(5,2),
    visibility DECIMAL(7,2),
    cloud_base DECIMAL(7,2),
    precipitation DECIMAL(6,2),
    status weather_status,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FLIGHT PLANS
CREATE TABLE flight_plans (
    id SERIAL PRIMARY KEY,
    flight_number VARCHAR(20) UNIQUE NOT NULL,
    aircraft_id INTEGER REFERENCES aircrafts(id),
    mission_type_id INTEGER REFERENCES mission_types(id),
    departure_airport_id INTEGER REFERENCES airports(id),
    arrival_airport_id INTEGER REFERENCES airports(id),
    alternate_airport_id INTEGER REFERENCES airports(id),
    planned_departure_time TIMESTAMP,
    estimated_arrival_time TIMESTAMP,
    flight_level DECIMAL(5,2),
    route_description TEXT,
    fuel_planned DECIMAL(9,2),
    status flight_status DEFAULT 'PLANNED',
    created_by INTEGER REFERENCES operator(user_id),
    approved_by INTEGER REFERENCES operator(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FLIGHTS
CREATE TABLE flights (
    id SERIAL PRIMARY KEY,
    flight_plan_id INTEGER REFERENCES flight_plans(id),
    actual_departure_time TIMESTAMP,
    actual_arrival_time TIMESTAMP,
    actual_fuel_used DECIMAL(9,2),
    max_altitude_reached DECIMAL(9,2),
    distance_traveled DECIMAL(9,2),
    mission_status mission_status DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FLIGHT POINTS
CREATE TABLE flight_points (
    id SERIAL PRIMARY KEY,
    flight_id INTEGER REFERENCES flights(id),
    sequence_number INTEGER,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    altitude DECIMAL(7,2),
    speed DECIMAL(7,2),
    heading DECIMAL(5,2),
    estimated_time_of_arrival TIMESTAMP,
    actual_time_of_arrival TIMESTAMP,
    point_type VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LOGS
CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL,
    action_description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- USER SESSIONS
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    session_token TEXT UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- HEXAGONS (for map grid system)
CREATE TABLE hexagons (
    id SERIAL PRIMARY KEY,
    center_latitude DECIMAL(9,6) NOT NULL,
    center_longitude DECIMAL(9,6) NOT NULL,
    radius DECIMAL(9,6) NOT NULL,
    grid_reference VARCHAR(20),
    elevation_min DECIMAL(7,2),
    elevation_max DECIMAL(7,2),
    terrain_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- ÖRNEK VERİLER
-- ================================

-- USERS tablosuna örnek veriler
INSERT INTO users (username, email, password_hash, role, is_active) VALUES
('admin', 'admin@kk.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfQAANMQmHBpC.m', 'admin', true),
('operator1', 'operator1@kk.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfQAANMQmHBpC.m', 'operator', true),
('supervisor1', 'supervisor1@kk.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfQAANMQmHBpC.m', 'supervisor', true);

-- UNIT tablosuna örnek veriler
INSERT INTO unit (unit_name, unit_code, description) VALUES
('1. Ana Jet Üs Komutanlığı', 'AJU1', 'Eskişehir Ana Jet Üs Komutanlığı'),
('2. Ana Jet Üs Komutanlığı', 'AJU2', 'Çiğli Ana Jet Üs Komutanlığı'),
('3. Ana Jet Üs Komutanlığı', 'AJU3', 'Konya Ana Jet Üs Komutanlığı');

-- STATION tablosuna örnek veriler
INSERT INTO station (unit_id, station_name, station_code, latitude, longitude, elevation) VALUES
(1, 'Eskişehir Kontrol Merkezi', 'ESK-KM', 39.784138, 30.519361, 785),
(2, 'Çiğli Kontrol Merkezi', 'CIG-KM', 38.513369, 27.010075, 5),
(3, 'Konya Kontrol Merkezi', 'KNY-KM', 37.980534, 32.561321, 1031);

-- OPERATOR tablosuna örnek veriler
INSERT INTO operator (operator_code, rank_id, first_name, last_name, email, phone, status, unit_id, station_id, authority_level, shift_start, shift_end) VALUES
('OP001', 1, 'Ahmet', 'Yılmaz', 'ahmet.yilmaz@kk.com', '5551234567', 'ACTIVE', 1, 1, 'HIGH', '08:00', '16:00'),
('OP002', 2, 'Mehmet', 'Kaya', 'mehmet.kaya@kk.com', '5551234568', 'ACTIVE', 2, 2, 'MEDIUM', '16:00', '00:00'),
('OP003', 1, 'Ayşe', 'Demir', 'ayse.demir@kk.com', '5551234569', 'ACTIVE', 3, 3, 'HIGH', '00:00', '08:00');

-- AIRPORTS tablosuna örnek veriler
INSERT INTO airports (name, icao_code, iata_code, latitude, longitude, elevation, city, country, runway_length, is_military) VALUES
('Eskişehir Hava Üssü', 'LTBY', 'ESK', 39.784138, 30.519361, 785, 'Eskişehir', 'Türkiye', 3350, true),
('Çiğli Hava Üssü', 'LTBL', 'IGL', 38.513369, 27.010075, 5, 'İzmir', 'Türkiye', 2800, true),
('Konya Hava Üssü', 'LTAN', 'KYA', 37.980534, 32.561321, 1031, 'Konya', 'Türkiye', 3200, true);

-- MISSION TYPES tablosuna örnek veriler
INSERT INTO mission_types (name, code, description) VALUES
('Eğitim Uçuşu', 'TRN', 'Pilot eğitim uçuşları'),
('Devriye Görevi', 'PTR', 'Hava sahası devriye görevi'),
('Tatbikat', 'EXE', 'Askeri tatbikat uçuşları');

-- AIRCRAFTS tablosuna örnek veriler
INSERT INTO aircrafts (code, tail_number, model, manufacturer, year_manufactured, owner, max_speed, cruise_speed, max_altitude, range, fuel_capacity, status) VALUES
('F16-001', 'TR-001', 'F-16C Block 50', 'Lockheed Martin', 1995, 'Türk Hava Kuvvetleri', 2120, 917, 15240, 3200, 3175, 'ACTIVE'),
('F16-002', 'TR-002', 'F-16C Block 50', 'Lockheed Martin', 1995, 'Türk Hava Kuvvetleri', 2120, 917, 15240, 3200, 3175, 'STANDBY'),
('F16-003', 'TR-003', 'F-16C Block 50', 'Lockheed Martin', 1996, 'Türk Hava Kuvvetleri', 2120, 917, 15240, 3200, 3175, 'MAINTENANCE');

-- AIRCRAFT_STATE tablosuna örnek veriler
INSERT INTO aircraft_state (aircraft_id, latitude, longitude, altitude, heading, ground_speed, vertical_speed, fuel_level) VALUES
(1, 39.784138, 30.519361, 5000, 270, 800, 0, 2500),
(2, 38.513369, 27.010075, 0, 0, 0, 0, 3000),
(3, 37.980534, 32.561321, 0, 0, 0, 0, 2800);

-- WEATHER_CONDITIONS tablosuna örnek veriler
INSERT INTO weather_conditions (airport_id, temperature, pressure, humidity, wind_speed, wind_direction, visibility, status) VALUES
(1, 15.5, 1013.25, 65, 10, 270, 10000, 'CLEAR'),
(2, 18.2, 1012.8, 70, 15, 180, 8000, 'CLOUDY'),
(3, 20.0, 1011.5, 55, 8, 90, 9000, 'CLEAR');

-- FLIGHT_PLANS tablosuna örnek veriler
INSERT INTO flight_plans (flight_number, aircraft_id, mission_type_id, departure_airport_id, arrival_airport_id, planned_departure_time, estimated_arrival_time, flight_level, status) VALUES
('TK001', 1, 1, 1, 2, '2024-03-20 10:00:00', '2024-03-20 11:30:00', 280, 'PLANNED'),
('TK002', 2, 2, 2, 3, '2024-03-20 14:00:00', '2024-03-20 15:30:00', 300, 'PLANNED'),
('TK003', 3, 3, 3, 1, '2024-03-21 09:00:00', '2024-03-21 10:30:00', 260, 'PLANNED');

-- FLIGHTS tablosuna örnek veriler
INSERT INTO flights (flight_plan_id, actual_departure_time, mission_status) VALUES
(1, '2024-03-20 10:05:00', 'IN_PROGRESS'),
(2, NULL, 'PENDING'),
(3, NULL, 'PENDING');

-- FLIGHT_POINTS tablosuna örnek veriler
INSERT INTO flight_points (flight_id, sequence_number, latitude, longitude, altitude, speed, heading, point_type) VALUES
(1, 1, 39.784138, 30.519361, 5000, 800, 270, 'DEPARTURE'),
(1, 2, 39.000000, 29.000000, 8000, 850, 270, 'WAYPOINT'),
(1, 3, 38.513369, 27.010075, 5000, 800, 270, 'ARRIVAL');

-- LOGS tablosuna örnek veriler
INSERT INTO logs (user_id, action_type, action_description, ip_address) VALUES
(1, 'LOGIN', 'Successful login', '192.168.1.100'),
(2, 'FLIGHT_CREATE', 'Created flight plan TK001', '192.168.1.101'),
(3, 'SYSTEM_UPDATE', 'Updated weather information', '192.168.1.102');

-- USER_SESSIONS tablosuna örnek veriler
INSERT INTO user_sessions (user_id, session_token, ip_address, is_active) VALUES
(1, 'token123', '192.168.1.100', true),
(2, 'token456', '192.168.1.101', true),
(3, 'token789', '192.168.1.102', false);

-- HEXAGONS tablosuna örnek veriler
INSERT INTO hexagons (center_latitude, center_longitude, radius, grid_reference, elevation_min, elevation_max, terrain_type) VALUES
(39.784138, 30.519361, 5.0, 'HEX001', 700, 800, 'MOUNTAIN'),
(38.513369, 27.010075, 5.0, 'HEX002', 0, 100, 'COASTAL'),
(37.980534, 32.561321, 5.0, 'HEX003', 900, 1100, 'PLATEAU');

-- AIRCRAFT_HISTORY tablosuna örnek veriler
INSERT INTO aircraft_history (aircraft_id, event_type, description, location, operator_id) VALUES
(1, 'MAINTENANCE', 'Rutin bakım tamamlandı', 1, 1),
(2, 'FUEL', 'Yakıt ikmali yapıldı', 2, 2),
(3, 'STATUS_CHANGE', 'Uçuş görevine hazır', 3, 3); 