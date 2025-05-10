// src/components/flightcontrol/AircraftInfoPopup.js (veya FlightDetailPanel.js)
import React from 'react'; // useEffect ve useRef artık burada gerekmeyebilir
import '../styles/AircraftInfoPopup.css'; // CSS dosyasının adını da değiştirebilirsiniz

const AircraftInfoPopup = ({ flight, onClose, onToggleRoute, isRouteVisible }) => {
  // Artık popupRef ve dışarı tıklama useEffect'ine ihtiyacımız yok,
  // çünkü panel sabit ve görünürlüğü selectedFlight state'i ile yönetiliyor.
  // Pozisyonlama CSS ile yapılacak.

  if (!flight) { // Eğer seçili uçak yoksa, paneli render etme (veya CSS ile gizle)
    return <div className="flight-detail-panel closed"></div>; // Veya null döndür
  }

  const formatTime = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const statusClass = `popup-status status-${flight.status || 'unknown'}`;

  return (
    // Ana sarmalayıcıya panelin açık/kapalı durumuna göre class ekleyelim
    <div className={`flight-detail-panel ${flight ? 'open' : 'closed'}`}>
      <div className="panel-header">
        <div className="flight-titles">
          <h3 className="panel-callsign">{flight.callsign || flight.id}</h3>
          <p className="panel-model">{flight.model}</p>
        </div>
        <button className="panel-close-btn" onClick={onClose} aria-label="Paneli Kapat">
          × {/* Çarpı işareti */}
        </button>
      </div>

      <div className="panel-actions">
        <button 
          className={`btn-panel-action ${isRouteVisible ? 'active' : ''}`}
          onClick={() => onToggleRoute(flight.id)}
          disabled={!flight.track || flight.track.length < 2} // Rota yoksa veya tek noktaysa butonu disable et
        >
          {isRouteVisible ? 'Rotayı Gizle' : 'Rotayı Göster'}
        </button>
        {/* Diğer aksiyon butonları buraya eklenebilir */}
      </div>

      <dl className="panel-content">
        {flight.origin && flight.destination && (
          <>
            <dt>Rota:</dt>
            <dd className="panel-route-text">{flight.origin} → {flight.destination}</dd>
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
    </div>
  );
};

export default AircraftInfoPopup;