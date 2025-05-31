import React from 'react';
import { getAircraftColorVars } from '../pages/mockFlightData'; 
import { useSettings } from '../context/SettingsContext';
import '../styles/AircraftIcon.css'; 
const AircraftSVG = ({ color, rotation, type }) => {

  if (type === 'hava-savunma') {
    return ( // Basit bir kare veya farklı bir sembol
      <svg width="24" height="24" viewBox="0 0 24 24" fill={color} style={{ transform: `rotate(${rotation || 0}deg)` }}>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        {/* Alternatif: <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 1.76L19.05 7 12 10.24 4.95 7 12 3.76zM4 9.34l8 4.66 8-4.66V17l-8 4.66L4 17V9.34z"/> (kalkan benzeri) */}
      </svg>
    );
  }

  return ( // Standart uçak ikonu
    <svg width="24" height="24" viewBox="0 0 24 24" fill={color} style={{ transform: `rotate(${rotation || 0}deg)` }}>
      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
    </svg>
  );
};


const AircraftIcon = ({ flight, onClick, isSelected, style }) => {
  const { settings } = useSettings();
  const theme = settings.theme || 'military'; // Varsayılan tema

  const aircraftColor = getAircraftColorVars(flight, isSelected, theme);

  // Uçağın yönünü heading'den alıp SVG rotasyonu için ayarlayalım.
  // Standart SVG'miz sağa bakıyor (0 derece). Heading 0 kuzeydir.
  // SVG'yi heading'e göre döndürmek için: (heading - 90) derece.
  // Eğer SVG yukarı bakıyorsa, direkt heading kullanılır.
  // Bizim path'imiz sağa baktığı için (heading - 90) mantıklı.
  const rotation = flight.heading ? flight.heading - 90 : 0;

  const iconClasses = [
    'aircraft-icon',
    isSelected ? 'selected' : '',
    flight.type === 'hava-savunma' ? 'defense-system-icon' : ''
  ].join(' ').trim();

  return (
    <div
      className={iconClasses}
      style={{
        ...style, // MapViewport'tan gelen top/left pozisyonu
        color: aircraftColor, // SVG'nin fill rengi için veya emoji rengi için
      }}
      onClick={onClick}
      title={`${flight.callsign} - ${flight.model}`} // Basit bir tooltip
    >
      <AircraftSVG color={aircraftColor} rotation={rotation} type={flight.type} />
      {/* Opsiyonel etiket, CSS ile hover'da gösterilecek */}
      {/* <span className="aircraft-label">{flight.callsign}</span> */}
    </div>
  );
};

export default AircraftIcon;