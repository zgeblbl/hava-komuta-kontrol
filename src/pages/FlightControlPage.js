import React, { useState, useEffect } from 'react';


import MapViewport from './MapViewport';
import AircraftInfoPopup from './AircraftInfoPopup';
import StatisticsPanel from './StatisticsPanel'; 
import { initialFlights } from './mockFlightData';

import '../styles/FlightControlPage.css'; 

import { useSettings } from '../context/SettingsContext';

import ToggleStatisticsButton from '../components/ToggleStatisticsButton'; 

const FlightControlPage = () => {
  const { settings } = useSettings();
  const [flights, setFlights] = useState(initialFlights);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [isStatisticsPanelOpen, setIsStatisticsPanelOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme || 'military');
  }, [settings.theme]);

  const toggleStatisticsPanel = () => {
    setIsStatisticsPanelOpen(prev => !prev);
  };

  const handleAircraftClick = (flight, event) => {
    setSelectedFlight(flight);
    if (event) {
      const popupWidth = 300;
      const popupHeight = 250;
      let posX = event.clientX + 15;
      let posY = event.clientY + 15;

      if (posX + popupWidth > window.innerWidth) {
        posX = event.clientX - popupWidth - 15;
      }
      if (posY + popupHeight > window.innerHeight) {
        posY = event.clientY - popupHeight - 15;
      }
      setPopupPosition({ x: Math.max(0, posX), y: Math.max(0, posY) });
    }
  };

  const handleClosePopup = () => {
    setSelectedFlight(null);
  };

  return (
    <div className="flight-control-page">
      <div className="page-actions-overlay">
        <ToggleStatisticsButton 
          isOpen={isStatisticsPanelOpen} 
          onClick={toggleStatisticsPanel} 
        />
      </div>
      
      <div className="map-viewport-container">
        <MapViewport
          flights={flights}
          onAircraftClick={handleAircraftClick}
          selectedFlightId={selectedFlight?.id}
        />
      </div>

      {selectedFlight && (
        <AircraftInfoPopup
          flight={selectedFlight}
          onClose={handleClosePopup}
          position={popupPosition}
        />
      )}

      {/* İstatistik Paneli - Saran div'in class'ı .statistics-panel-container */}
      <div className={`statistics-panel-container ${isStatisticsPanelOpen ? 'open' : ''}`}>
        {/* StatisticsPanel bileşeninin içindeki en dış div'e .statistics-content-wrapper class'ını verin */}
        <StatisticsPanel flights={flights} /> 
      </div>
    </div>
  );
};

export default FlightControlPage;