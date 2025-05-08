import React, { useEffect, useRef } from 'react';
import '../styles/AircraftInfoPopup.css'; 

const AircraftInfoPopup = ({ flight, onClose, position /*, theme */ }) => {
  const popupRef = useRef(null);

  useEffect(() => {
    // Popup açıldığında görünür yap ve pozisyonla
    if (flight && popupRef.current) {
      popupRef.current.style.opacity = '1';
      popupRef.current.style.transform = 'scale(1)'; // Veya pozisyona göre translate
      // Pozisyonu ayarla (FlightControlPage'den geliyor)
      popupRef.current.style.left = `${position.x}px`;
      popupRef.current.style.top = `${position.y}px`;

      // Dışarı tıklandığında kapatmak için event listener
      const handleClickOutside = (event) => {
        if (popupRef.current && !popupRef.current.contains(event.target)) {
          onClose();
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    } else if (popupRef.current) {
      // Kapanırken animasyon için
      popupRef.current.style.opacity = '0';
      popupRef.current.style.transform = 'scale(0.95)';
    }
  }, [flight, onClose, position]);

  if (!flight) {
    return null;
  }

  const formatTime = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Dinamik durum sınıfı
  const statusClass = `popup-status status-${flight.status || 'unknown'}`;

  return (
    <div
      ref={popupRef}
      className="aircraft-info-popup"
      // style={{ left: `${position.x}px`, top: `${position.y}px` }} // useEffect içinde ayarlanıyor
    >
      <div className="popup-header">
        <div>
          <h3 className="popup-callsign">{flight.callsign || flight.id}</h3>
          <p className="popup-model">{flight.model}</p>
        </div>
        <button className="popup-close-btn" onClick={onClose} aria-label="Kapat">
          ×
        </button>
      </div>
      <dl className="popup-content">
        {flight.origin && flight.destination && (
          <>
            <dt>Rota:</dt>
            <dd className="popup-route">{flight.origin} → {flight.destination}</dd>
          </>
        )}
        <dt>İrtifa:</dt>
        <dd>{flight.altitude ? `${flight.altitude.toLocaleString()} ft` : 'N/A'}</dd>
        <dt>Hız:</dt>
        <dd>{flight.speed ? `${flight.speed} kts` : 'N/A'}</dd>
        <dt>Baş (Heading):</dt>
        <dd>{typeof flight.heading === 'number' ? `${flight.heading}°` : 'N/A'}</dd>
        <dt>Durum:</dt>
        <dd><span className={statusClass}>{flight.status || 'Bilinmiyor'}</span></dd>
        {flight.type && (
            <>
                <dt>Tip:</dt>
                <dd style={{textTransform: 'capitalize'}}>{flight.type}</dd>
            </>
        )}
        {flight.departureTime && (
            <>
                <dt>Kalkış (STD):</dt>
                <dd>{formatTime(flight.departureTime)}</dd>
            </>
        )}
        {flight.estimatedArrivalTime && (
            <>
                <dt>Varış (ETA):</dt>
                <dd>{formatTime(flight.estimatedArrivalTime)}</dd>
            </>
        )}
      </dl>
      {/* Opsiyonel: Daha fazla detay veya "Uçuş Detayları" butonu */}
      {/* <button className="btn btn-secondary btn-sm">Detayları Gör</button> */}
    </div>
  );
};

export default AircraftInfoPopup;