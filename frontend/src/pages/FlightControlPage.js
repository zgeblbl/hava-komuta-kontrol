import React, { useState, useEffect } from 'react';

// Kendi klasör yapınıza göre yolları KONTROL EDİN!
import MapViewport from './MapViewport';
import AircraftInfoPopup from './AircraftInfoPopup'; // Veya FlightDetailPanel.js
import StatisticsPanel from './StatisticsPanel';
import { initialFlights } from './mockFlightData';

import '../styles/FlightControlPage.css'; 

import { useSettings } from '../context/SettingsContext';
import ToggleStatisticsButton from '../components/ToggleStatisticsButton'; 

const FlightControlPage = () => {
  const { settings } = useSettings();
  const [flights, setFlights] = useState(initialFlights);
  const [selectedFlight, setSelectedFlight] = useState(null); // Uçuş detay panelini kontrol eder
  const [isStatisticsPanelOpen, setIsStatisticsPanelOpen] = useState(false); // Sağdaki istatistik paneli
  const [showRouteForFlightId, setShowRouteForFlightId] = useState(null); // Hangi uçağın rotası gösterilecek (ID'si)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme || 'military');
  }, [settings.theme]);

  const toggleStatisticsPanel = () => {
    setIsStatisticsPanelOpen(prev => !prev);
  };

  const handleAircraftClick = (flight, event) => { // event artık kullanılmıyor olabilir
    setSelectedFlight(flight);
    // Yeni bir uçak seçildiğinde, eğer varsa önceki uçağın rotasını gizle
    if (showRouteForFlightId && showRouteForFlightId !== flight.id) {
        setShowRouteForFlightId(null);
    }
    // setPopupPosition artık kullanılmıyor
  };

  // Bu fonksiyon artık Uçuş Detay Paneli'ni kapatacak
  const handleCloseDetailPanel = () => {
    setSelectedFlight(null);
    // Detay paneli kapandığında, gösterilen rotayı da temizle (isteğe bağlı)
    // setShowRouteForFlightId(null); 
  };

  // Uçuş Detay Panelindeki "Rota Göster/Gizle" butonu için
  const handleToggleRouteDisplay = (flightId) => {
    setShowRouteForFlightId(prevFlightId => (prevFlightId === flightId ? null : flightId));
  };

  return (
    <div className="flight-control-page">
      <div className="page-actions-overlay">
        <ToggleStatisticsButton 
          isOpen={isStatisticsPanelOpen} 
          onClick={toggleStatisticsPanel} 
        />
      </div>
      
      {/* SOL TARAF UÇUŞ DETAY PANELİ */}
      {/* AircraftInfoPopup (veya FlightDetailPanel) bileşeni burada render edilecek.
          Görünürlüğü selectedFlight state'ine ve CSS'teki .open/.closed class'larına bağlı olacak. */}
      <AircraftInfoPopup 
        flight={selectedFlight}  // Seçili uçak varsa detayları gösterir, yoksa panel gizlenir (CSS ile)
        onClose={handleCloseDetailPanel}
        onToggleRoute={handleToggleRouteDisplay} // Rota gösterme/gizleme fonksiyonu
        isRouteVisible={!!(selectedFlight && showRouteForFlightId === selectedFlight.id)} // Rota görünür mü?
      />

      <div className="map-viewport-container">
        <MapViewport
          flights={flights}
          onAircraftClick={handleAircraftClick}
          selectedFlightId={selectedFlight?.id}
          routeForFlightId={showRouteForFlightId} // Haritaya hangi uçağın rotasının çizileceğini bildir
        />
      </div>

      {/* SAĞ TARAF İSTATİSTİK PANELİ */}
      <div className={`statistics-panel-container ${isStatisticsPanelOpen ? 'open' : ''}`}>
        <StatisticsPanel flights={flights} /> 
      </div>
    </div>
  );
};

export default FlightControlPage;