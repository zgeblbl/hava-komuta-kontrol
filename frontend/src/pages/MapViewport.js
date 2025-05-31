import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import AnimatedFlight from './AnimatedFlight';

import { useSettings } from '../context/SettingsContext'; 
import { getAircraftColorVars } from './mockFlightData'; 

import '../styles/MapViewport.css'; 

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const LeafletAircraftMarker = ({ flight, onClick, isSelected }) => {
  const { settings } = useSettings();
  const theme = settings.theme || 'military'; // Varsayılanı military veya dark olabilir
  const color = getAircraftColorVars(flight, isSelected, theme);
  
  const rotation = flight.heading ? flight.heading - 90 : 0;

  const aircraftSvgPath = flight.type === 'hava-savunma' 
    ? '<rect x="4" y="4" width="16" height="16" rx="2" ry="2" />'
    : '<path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>';

  const iconHtml = `
    <div 
      class="leaflet-custom-aircraft-icon ${isSelected ? 'selected' : ''}" 
      style="transform: rotate(${rotation}deg); color: ${color};" 
      title="${flight.callsign} - ${flight.model}"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        ${aircraftSvgPath}
      </svg>
    </div>
  `;

  const customIcon = L.divIcon({
    html: iconHtml,
    className: '', 
    iconSize: [28, 28], 
    iconAnchor: [14, 14], 
  });
  
  return (
    <Marker
      position={[flight.latitude, flight.longitude]}
      icon={customIcon}
      eventHandlers={{
        click: (e) => {
          onClick(flight, e.originalEvent); 
        },
      }}
    />
  );
};

function FlightPath({ flightData, routeColor }) {
  const map = useMap();
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    if (flightData && flightData.track && flightData.track.length > 1) {
      const newPositions = flightData.track.map(p => [p.lat, p.lon]);
      setPositions(newPositions);
    } else {
      setPositions([]);
    }
  }, [flightData, map]);

  if (positions.length < 2) {
    return null;
  }

  const pathStyle = { 
    color: routeColor || 'var(--flight-path, rgba(0, 100, 255, 0.7))',
    weight: 2,
    opacity: 0.8,
  };

  return <Polyline pathOptions={pathStyle} positions={positions} />;
}


const MapViewport = ({ flights, onAircraftClick, selectedFlightId, routeForFlightId }) => {
  const mapRef = useRef(null);
  const initialPosition = [39.92077, 32.85411];
  const initialZoom = 6;

  const { settings } = useSettings();
  const currentTheme = settings.theme || 'military'; // Varsayılanı 'military' veya 'dark' olabilir

  const flightForRoute = flights.find(f => f.id === routeForFlightId);

  // Temaya göre harita tile URL'sini ve attribution'ı seç
  let tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"; // Varsayılan (Light)
  let tileAttribution = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  if (currentTheme === 'dark' || currentTheme === 'military') { // Military tema için de koyu harita kullanalım
    tileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    tileAttribution = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>';
  } else if (currentTheme === 'light') {
    // Açık tema için farklı bir seçenek (örneğin CARTO Voyager)
    tileUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    tileAttribution = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>';
    // Veya OpenStreetMap'in varsayılanı da kalabilir:
    // tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    // tileAttribution = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  }
  // İsterseniz daha fazla tema ve karşılık gelen tileUrl ekleyebilirsiniz.

  return (
    <div className="map-viewport-container-leaflet"> 
      <MapContainer 
         key={currentTheme} // <<--- TEMA DEĞİŞTİĞİNDE HARİTAYI YENİDEN OLUŞTURMAK İÇİN KEY EKLE
         center={initialPosition} 
         zoom={initialZoom} 
         ref={mapRef} 
         style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution={tileAttribution}
          url={tileUrl}
        />
        
        {flights.map(flight => (
          <LeafletAircraftMarker
            key={flight.id}
            flight={flight}
            onClick={onAircraftClick}
            isSelected={flight.id === selectedFlightId}
          />
        ))}

        {flightForRoute && flightForRoute.track && flightForRoute.track.length > 1 && (
          <FlightPath 
            flightData={flightForRoute}
            routeColor={getAircraftColorVars(flightForRoute, true, currentTheme)} 
          />
        )}
        {flights.map(flight => {
          if (!flight.track || flight.track.length < 2) return null;

          const start = [flight.track[0].lat, flight.track[0].lon];
          const end = [flight.track[flight.track.length - 1].lat, flight.track[flight.track.length - 1].lon];

          return (
            <AnimatedFlight
              key={`animated-${flight.id}`}
              flight={{ id: flight.id, start, end }}
              duration={8000} // Adjust duration per flight if you want
            />
          );
        })}

      </MapContainer>
    </div>
  );
};

export default MapViewport;