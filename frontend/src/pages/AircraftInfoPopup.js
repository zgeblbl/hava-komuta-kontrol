// src/components/flightcontrol/AircraftInfoPopup.js
import React, { useState, useEffect, useRef } from 'react';
import '../styles/AircraftInfoPopup.css';
import { 
  FaPlane, FaRoute, FaArrowRight, FaClock, FaMapMarkerAlt, 
  FaTachometerAlt, FaArrowsAltV, FaCompass, FaInfoCircle, FaTimes,
  FaChevronDown, FaChevronUp, FaChevronLeft, FaChevronRight, 
  FaRegListAlt, FaHistory, FaCalendarAlt, FaFileAlt, FaShieldAlt,
  FaChartLine, FaCloud, FaGlobeAmericas, FaRegIdCard
} from 'react-icons/fa';

const AircraftInfoPopup = ({ flight, onClose, onToggleRoute, isRouteVisible }) => {
  const [activeImage, setActiveImage] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    aircraftInfo: true,
    flightData: true,
    flightDetails: true,
    technicalData: false,
    weather: false
  });
  
  // Animasyon için referanslar
  const planeIconRef = useRef(null);
  const progressBarRef = useRef(null);
  
  // Uçak ikonunun konumunu güncelle
  useEffect(() => {
    if (flight && flight.distanceTraveled && flight.totalDistance && planeIconRef.current) {
      const progressPercentage = (flight.distanceTraveled / flight.totalDistance) * 100;
      const planePosition = Math.min(Math.max(progressPercentage, 0), 100);
      planeIconRef.current.style.left = `${planePosition}%`;
    }
  }, [flight]);

  // Default aircraft images if none provided
  const defaultImages = [
    'https://www.flightradar24.com/static/images/aircraft_silhouettes/A320_silhouette.png',
    'https://www.flightradar24.com/static/images/aircraft_silhouettes/A330_silhouette.png'
  ];

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  const nextImage = () => {
    if (flight) {
      const aircraftImages = flight.images || (flight.imageUrl ? [flight.imageUrl] : defaultImages);
      setActiveImage((activeImage + 1) % aircraftImages.length);
    }
  };

  const prevImage = () => {
    if (flight) {
      const aircraftImages = flight.images || (flight.imageUrl ? [flight.imageUrl] : defaultImages);
      setActiveImage((activeImage - 1 + aircraftImages.length) % aircraftImages.length);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Kalan süreyi dinamik olarak düzenle
  const formatRemainingTime = (minutes) => {
    if (!minutes && minutes !== 0) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  
  // HH:MM formatında kalan süre
  const formatTimeHHMM = (minutes) => {
    if (!minutes && minutes !== 0) return '--:--';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  if (!flight) {
    return <div className="flight-detail-panel closed"></div>;
  }

  // Safe to use flight now after the check
  const aircraftImages = flight.images || (flight.imageUrl ? [flight.imageUrl] : defaultImages);
  const statusClass = `status-badge status-${flight.status || 'unknown'}`;
  const flightProgress = flight.distanceTraveled && flight.totalDistance 
    ? (flight.distanceTraveled / flight.totalDistance) * 100 
    : 0;
    
  // Varış süresini hesapla
  const timeRemaining = flight.estimatedTimeRemaining || (flight.remainingDistance ? Math.round(flight.remainingDistance / (flight.speed || 400) * 60) : null);

  return (
    <div className={`flight-detail-panel ${flight ? 'open' : 'closed'}`}>
      {/* Header with flight callsign and close button */}
      <div className="panel-header">
        <div className="flight-titles">
          <h3 className="panel-callsign">{flight.callsign || flight.id}</h3>
          <p className="panel-model">{flight.model || 'Unknown Aircraft'}</p>
        </div>
        <button className="panel-close-btn" onClick={onClose} aria-label="Paneli Kapat">
          <FaTimes />
        </button>
      </div>

      {/* Aircraft Image Gallery */}
      <div className="aircraft-image-container">
        <div className="image-gallery">
          <img 
            src={aircraftImages[activeImage]} 
            alt={`${flight.model || 'Aircraft'}`} 
            className="aircraft-image"
            onError={(e) => {e.target.src = defaultImages[0]}}
          />
          
          {aircraftImages.length > 1 && (
            <>
              <button className="gallery-nav prev" onClick={prevImage} aria-label="Previous image">
                <FaChevronLeft />
              </button>
              <button className="gallery-nav next" onClick={nextImage} aria-label="Next image">
                <FaChevronRight />
              </button>
              <div className="image-dots">
                {aircraftImages.map((_, index) => (
                  <span 
                    key={index} 
                    className={`image-dot ${index === activeImage ? 'active' : ''}`}
                    onClick={() => setActiveImage(index)}
                  />
                ))}
              </div>
            </>
          )}
          
          {flight.imageCredit && (
            <div className="image-credit">© {flight.imageCredit}</div>
          )}
        </div>
      </div>

      {/* Enhanced Route Display with Route Codes */}
      {(flight.origin && flight.destination) && (
        <div className="route-display-enhanced">
          <div className="route-airports">
            <div className="origin-airport">
              <div className="airport-code">{flight.origin}</div>
              <div className="airport-name">{flight.originName || 'Departure'}</div>
              <div className="timezone">{flight.originTimezone || ''}</div>
            </div>
            
            <div className="destination-airport">
              <div className="airport-code">{flight.destination}</div>
              <div className="airport-name">{flight.destinationName || 'Arrival'}</div>
              <div className="timezone">{flight.destinationTimezone || ''}</div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Flight Schedule Display */}
      <div className="schedule-display">
        <div className="schedule-grid">
          <div className="schedule-label">SCHEDULED</div>
          <div className="schedule-label origin-label">DEPARTURE</div>
          <div className="schedule-label dest-label">ARRIVAL</div>
          
          <div className="schedule-time departure-time">
            <div className="time">{formatTime(flight.departureTime) || '--:--'}</div>
          </div>
          
          <div className="schedule-time arrival-time">
            <div className="time">{formatTime(flight.estimatedArrivalTime) || '--:--'}</div>
          </div>
          
          {flight.actualDepartureTime && (
            <>
              <div className="schedule-label actual">ACTUAL</div>
              <div className="schedule-time departure-time actual">
                <div className="time actual">{formatTime(flight.actualDepartureTime)}</div>
              </div>
              
              <div className="schedule-time arrival-time estimated">
                <div className="time estimated">{formatTime(flight.estimatedArrivalTime)}</div>
                <div className="estimated-dot"></div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Enhanced Flight Progress with Animated Plane */}
      <div className="flight-progress-section">
        <div className="flight-progress-bar">
          <div className="progress-track">
            <div 
              className="progress-fill" 
              style={{ width: `${flightProgress}%` }}
              ref={progressBarRef}
            ></div>
            <div 
              className="progress-plane" 
              style={{ left: `${flightProgress}%` }}
              ref={planeIconRef}
            >
              <FaPlane className="plane-icon" />
            </div>
            <div className="route-dots">
              <span className="route-dot origin"></span>
              <span className="route-dot destination"></span>
            </div>
          </div>
          
          <div className="progress-labels">
            <div className="progress-time">
              <div className="label">Flight Time</div>
              <div className="value">{flight.elapsedTime || '00:00'}</div>
            </div>
            
            <div className="progress-distance">
              <div className="label">Distance</div>
              <div className="value">
                {flight.distanceTraveled ? `${flight.distanceTraveled.toLocaleString()} km` : 'N/A'}
              </div>
            </div>
            
            <div className="progress-remaining">
              <div className="label">Remaining</div>
              <div className="value">
                {timeRemaining ? formatTimeHHMM(timeRemaining) : 'N/A'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flight-status-details">
          <div className="detail-item">
            <div className="detail-label">Ground Speed</div>
            <div className="detail-value">{flight.speed || flight.groundspeed || 'N/A'} kts</div>
          </div>
          
          <div className="detail-item">
            <div className="detail-label">Altitude</div>
            <div className="detail-value">{flight.altitude ? `${flight.altitude.toLocaleString()} ft` : 'N/A'}</div>
          </div>
          
          <div className="detail-item">
            <div className="detail-label">Status</div>
            <div className="detail-value"><span className={statusClass}>{flight.status || 'Unknown'}</span></div>
          </div>
        </div>
      </div>

      {/* Panel action buttons */}
      <div className="panel-actions">
        <button 
          className={`btn-panel-action ${isRouteVisible ? 'active' : ''}`}
          onClick={() => onToggleRoute(flight.id)}
          disabled={!flight.track || flight.track.length < 2}
        >
          <FaRoute /> {isRouteVisible ? 'Rotayı Gizle' : 'Rotayı Göster'}
        </button>
        
        <button className="btn-panel-action">
          <FaHistory /> Uçuş Geçmişi
        </button>
      </div>

      {/* Flight details in accordion sections */}
      <div className="details-accordion">
        {/* Aircraft Info Section */}
        <div className="accordion-section">
          <div 
            className={`section-header ${!expandedSections.aircraftInfo ? 'collapsed' : ''}`}
            onClick={() => toggleSection('aircraftInfo')}
          >
            <FaPlane /> AIRCRAFT INFO
            <span className="toggle-icon">
              {expandedSections.aircraftInfo ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          </div>
          <div className={`section-content ${!expandedSections.aircraftInfo ? 'collapsed' : ''}`}>
            <div className="detail-row">
              <div className="detail-label">Type:</div>
              <div className="detail-value" style={{textTransform: 'capitalize'}}>{flight.type || 'Unknown'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Aircraft:</div>
              <div className="detail-value">{flight.aircraftType || flight.model || 'N/A'}</div>
            </div>
            {flight.registration && (
              <div className="detail-row">
                <div className="detail-label">Registration:</div>
                <div className="detail-value highlight">{flight.registration}</div>
              </div>
            )}
            {flight.serialNumber && (
              <div className="detail-row">
                <div className="detail-label">Serial Number:</div>
                <div className="detail-value">{flight.serialNumber}</div>
              </div>
            )}
            {flight.age && (
              <div className="detail-row">
                <div className="detail-label">Age:</div>
                <div className="detail-value">{flight.age} years</div>
              </div>
            )}
            <div className="detail-row">
              <div className="detail-label">Category:</div>
              <div className="detail-value">{flight.category || 'Unknown'}</div>
            </div>
          </div>
        </div>

        {/* Flight Data Section */}
        <div className="accordion-section">
          <div 
            className={`section-header ${!expandedSections.flightData ? 'collapsed' : ''}`}
            onClick={() => toggleSection('flightData')}
          >
            <FaInfoCircle /> FLIGHT DATA
            <span className="toggle-icon">
              {expandedSections.flightData ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          </div>
          <div className={`section-content ${!expandedSections.flightData ? 'collapsed' : ''}`}>
            <div className="detail-row">
              <div className="detail-label">Altitude:</div>
              <div className="detail-value highlight">{flight.altitude ? `${flight.altitude.toLocaleString()} ft` : 'N/A'}</div>
            </div>
            {flight.verticalSpeed !== undefined && (
              <div className="detail-row">
                <div className="detail-label">Vertical Speed:</div>
                <div className="detail-value">{flight.verticalSpeed} ft/min</div>
              </div>
            )}
            <div className="detail-row">
              <div className="detail-label">Ground Speed:</div>
              <div className="detail-value highlight">{flight.speed || flight.groundspeed ? `${flight.speed || flight.groundspeed} kts` : 'N/A'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Heading:</div>
              <div className="detail-value">{typeof flight.heading === 'number' ? `${flight.heading}°` : 'N/A'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Status:</div>
              <div className="detail-value"><span className={statusClass}>{flight.status || 'Unknown'}</span></div>
            </div>
            {flight.squawk && (
              <div className="detail-row">
                <div className="detail-label">Squawk:</div>
                <div className="detail-value">{flight.squawk}</div>
              </div>
            )}
          </div>
        </div>

        {/* Flight Details Section */}
        <div className="accordion-section">
          <div 
            className={`section-header ${!expandedSections.flightDetails ? 'collapsed' : ''}`}
            onClick={() => toggleSection('flightDetails')}
          >
            <FaRegListAlt /> FLIGHT DETAILS
            <span className="toggle-icon">
              {expandedSections.flightDetails ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          </div>
          <div className={`section-content ${!expandedSections.flightDetails ? 'collapsed' : ''}`}>
            <div className="detail-row">
              <div className="detail-label">Flight Number:</div>
              <div className="detail-value highlight">{flight.flightNumber || flight.callsign || 'N/A'}</div>
            </div>
            {flight.airline && (
              <div className="detail-row">
                <div className="detail-label">Airline:</div>
                <div className="detail-value">{flight.airline}</div>
              </div>
            )}
            <div className="detail-row">
              <div className="detail-label">Origin:</div>
              <div className="detail-value">
                {flight.origin} {flight.originName ? `(${flight.originName})` : ''}
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Destination:</div>
              <div className="detail-value">
                {flight.destination} {flight.destinationName ? `(${flight.destinationName})` : ''}
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Departure:</div>
              <div className="detail-value">
                {flight.departureTime ? formatTime(flight.departureTime) : 'N/A'} 
                {flight.scheduledDepartureDate ? ` (${formatDate(flight.scheduledDepartureDate)})` : ''}
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Arrival:</div>
              <div className="detail-value">
                {flight.estimatedArrivalTime ? formatTime(flight.estimatedArrivalTime) : 'N/A'}
                {flight.scheduledArrivalDate ? ` (${formatDate(flight.scheduledArrivalDate)})` : ''}
              </div>
            </div>
            {flight.flightTime && (
              <div className="detail-row">
                <div className="detail-label">Flight Time:</div>
                <div className="detail-value">{flight.flightTime}</div>
              </div>
            )}
          </div>
        </div>

        {/* Technical Data Section */}
        <div className="accordion-section">
          <div 
            className={`section-header ${!expandedSections.technicalData ? 'collapsed' : ''}`}
            onClick={() => toggleSection('technicalData')}
          >
            <FaChartLine /> TECHNICAL DATA
            <span className="toggle-icon">
              {expandedSections.technicalData ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          </div>
          <div className={`section-content ${!expandedSections.technicalData ? 'collapsed' : ''}`}>
          {flight.equipment && (
              <div className="detail-row">
                <div className="detail-label">Equipment:</div>
                <div className="detail-value">{flight.equipment}</div>
              </div>
            )}
            {flight.transponder && (
              <div className="detail-row">
                <div className="detail-label">Transponder:</div>
                <div className="detail-value">{flight.transponder}</div>
              </div>
            )}
            {flight.radar && (
              <div className="detail-row">
                <div className="detail-label">Radar:</div>
                <div className="detail-value">{flight.radar}</div>
              </div>
            )}
            <div className="detail-row">
              <div className="detail-label">GPS Altitude:</div>
              <div className="detail-value">
                {flight.gpsAltitude ? `${flight.gpsAltitude.toLocaleString()} ft` : 'N/A'}
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Track:</div>
              <div className="detail-value">
                {flight.track && flight.track.length > 0 ? `${flight.track.length} points` : 'No data'}
              </div>
            </div>
          </div>
        </div>

        {/* Weather Section */}
        <div className="accordion-section">
          <div 
            className={`section-header ${!expandedSections.weather ? 'collapsed' : ''}`}
            onClick={() => toggleSection('weather')}
          >
            <FaCloud /> WEATHER
            <span className="toggle-icon">
              {expandedSections.weather ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          </div>
          <div className={`section-content ${!expandedSections.weather ? 'collapsed' : ''}`}>
            <div className="detail-row weather-message">
              <div className="detail-value center">
                Weather data is not available
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional flight info footer */}
      <div className="flight-additional-info">
        <div className="data-source">
          <FaGlobeAmericas />
          <span>Data from ADS-B network</span>
        </div>
        <div className="flight-updated-at">
          {flight.lastUpdate ? `Updated: ${formatTime(flight.lastUpdate)}` : 'Live data'}
        </div>
      </div>
    </div>
  );
};

export default AircraftInfoPopup;