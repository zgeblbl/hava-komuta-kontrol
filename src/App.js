import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const aircraftIcon = new L.Icon({
  iconUrl: "https://img.icons8.com/ios-filled/50/airplane-take-off.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

function App() {
  const [aircrafts, setAircrafts] = useState([]);

  const fetchAircrafts = async () => {
    try {
      const res = await axios.get("http://localhost:8000/aircraft/");
      setAircrafts(res.data);
    } catch (err) {
      console.error("Error fetching aircrafts:", err);
    }
  };

  useEffect(() => {
    fetchAircrafts();
    const interval = setInterval(fetchAircrafts, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <MapContainer
      center={[39.9, 32.85]}
      zoom={7}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        attribution="OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {aircrafts.map((ac) => (
        <Marker
          key={ac.id}
          position={[ac.latitude, ac.longitude]}
          icon={aircraftIcon}
          rotationAngle={ac.heading}
          rotationOrigin="center"
        >
          <Popup>
            <b>Aircraft #{ac.id}</b><br />
            Altitude: {ac.altitude} m<br />
            Speed: {ac.speed} km/h<br />
            Heading: {ac.heading}°
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default App;
