import React, { useRef } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

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
  const theme = settings.theme || 'military';
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
  
  const markerClassName = isSelected ? 'leaflet-marker-icon selected-marker' : 'leaflet-marker-icon';

  return (
    <Marker
      position={[flight.latitude, flight.longitude]}
      icon={customIcon}
      eventHandlers={{
        click: (e) => {
       
          onClick(flight, e.originalEvent); 
        },
      }}
  
    >
      {/* 
        AircraftInfoPopup'ı burada Leaflet'in kendi Popup'ı olarak kullanabiliriz
        VEYA mevcut pop-up mekanizmamızı harita üzerinde konumlandırmaya devam edebiliriz.
        Şimdilik, tıklama olayını yukarıya iletiyoruz, pop-up dışarıda yönetiliyor.
      */}
    </Marker>
  );
};


const MapViewport = ({ flights, onAircraftClick, selectedFlightId }) => {
  const mapRef = useRef(null);
  const initialPosition = [39.92077, 32.85411]; // Ankara
  const initialZoom = 6; // Türkiye'yi gösterecek genel bir zoom

  return (
    // CSS için yeni class adı
    <div className="map-viewport-container-leaflet"> 
      <MapContainer 
         center={initialPosition} 
         zoom={initialZoom} 
         ref={mapRef} 
         style={{ height: '100%', width: '100%' }}
         // scrollWheelZoom={true} // Fare tekerleği ile zoom'u etkinleştir/devre dışı bırak
         // dragging={true}      // Sürüklemeyi etkinleştir/devre dışı bırak
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          // Diğer tile layer seçenekleri (bazıları API anahtarı gerektirebilir)
          // Koyu tema için: https://carto.com/help/building-maps/basemap-list/
          // url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          // url='https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png' // Daha modern bir açık tema
        />
        
        {flights.map(flight => (
          <LeafletAircraftMarker
            key={flight.id}
            flight={flight}
            onClick={onAircraftClick}
            isSelected={flight.id === selectedFlightId}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default MapViewport;