import React, { useState, useEffect, useCallback, useRef } from 'react';

import MapViewport            from './MapViewport';
import AircraftInfoPopup      from './AircraftInfoPopup';
import StatisticsPanel        from './StatisticsPanel';
import ToggleStatisticsButton from '../components/ToggleStatisticsButton';

// src/pages/FlightControlPage.js  (İLK satırlar)

import aviationDatabase, {
  initialFlights as defaultInitialFlights,
  generateRandomFlight,
  AIRPORTS_DATA,
  AIRPORT_LOCATIONS,
  getRandomInt,
  getDistance
} from './aviationDatabase';   // ←  utils klasörü için ../

import { useSettings } from '../context/SettingsContext';
import '../styles/FlightControlPage.css';

/* ────────────────────────────────────────────────
   BASİT VERİ PAYLAŞIM MEKANİZMASI  
   AdminAircraft, subscribeFlights ile veriyi alacak
──────────────────────────────────────────────── */
let flightListeners = [];                 // Abone fonksiyonlar
let currentFlightsSnapshot = [];          // Son flight dizisi

export const subscribeFlights = (listener) => {
  if (typeof listener === 'function') {
    flightListeners.push(listener);
    listener(currentFlightsSnapshot);     // abone olurken anlık veriyi gönder
  }
  // unsubscribe fonksiyonu döndür
  return () => {
    flightListeners = flightListeners.filter((l) => l !== listener);
  };
};
/* ──────────────────────────────────────────────── */

const MAX_TOTAL_FLIGHTS    = 10;   // toplam uçuş limiti
const MAX_AIRBORNE_FLIGHTS = 5;    // aynı anda havada limiti
const FLIGHT_UPDATE_INTERVAL = 15000; // ms

const FlightControlPage = () => {
  const { settings } = useSettings();

  /* ilk render’da snapshot’ı doldur */
  const [flights, setFlights] = useState(() => {
    currentFlightsSnapshot = defaultInitialFlights;
    return defaultInitialFlights;
  });

  const [selectedFlight, setSelectedFlight]         = useState(null);
  const [isStatisticsPanelOpen, setIsStatisticsPanelOpen] = useState(false);
  const [showRouteForFlightId, setShowRouteForFlightId]   = useState(null);
  const flightIntervalRef = useRef(null);

  /* Tema ayarı */
  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      settings.theme || 'military'
    );
  }, [settings.theme]);

  /* ─────────────────────────
     ANA GÜNCELLEME / EKLEME
  ────────────────────────── */
  const updateAndAddFlights = useCallback(() => {
    setFlights((prevFlights) => {
      let updatedFlights = [...prevFlights];

      /* ----------------------------------------------------------
         1) ROTADA OLAN UÇUŞLARI KONUM GÜNCELLE
      ---------------------------------------------------------- */
      updatedFlights = updatedFlights.map((flight) => {
        // Hava savunma sistemleri sabit kalır
        if (flight.type === 'hava-savunma') return flight;

        // Havada ilerliyorsa
        if (flight.status === 'enroute' && flight.track && flight.track.length) {
          const moveOffset =
            ((flight.speed || 0) * 1.852) / 3600 * (FLIGHT_UPDATE_INTERVAL / 1000) / 111;

          let newLat = flight.latitude;
          let newLon = flight.longitude;

          // rota üzerindeki bir sonraki noktayı bul
          let targetPoint = null;
          for (let i = 0; i < flight.track.length; i++) {
            const p = flight.track[i];
            const dist = getDistance(flight.latitude, flight.longitude, p.lat, p.lon);
            if (dist > 5) {
              targetPoint = p;
              break;
            }
          }

          if (targetPoint) {
            const dy = targetPoint.lat - flight.latitude;
            const dx = targetPoint.lon - flight.longitude;
            const heading = (Math.atan2(dx, dy) * 180) / Math.PI + 360;
            const headingRad = (heading % 360) * (Math.PI / 180);

            newLat += moveOffset * Math.cos(headingRad);
            newLon += moveOffset * Math.sin(headingRad);

            // Varışa yakınsa inmiş say
            const destCoords = flight.track[flight.track.length - 1];
            if (getDistance(newLat, newLon, destCoords.lat, destCoords.lon) < 15) {
              return {
                ...flight,
                status: 'landed',
                latitude: destCoords.lat,
                longitude: destCoords.lon,
                speed: 0,
                altitude: 0,
                heading: heading % 360
              };
            }

            return {
              ...flight,
              latitude: parseFloat(newLat.toFixed(4)),
              longitude: parseFloat(newLon.toFixed(4)),
              heading: parseFloat((heading % 360).toFixed(1))
            };
          }
        }
        return flight;
      });

      /* ----------------------------------------------------------
         2) SCHEDULED UÇUŞLARIN KALKIŞINI YÖNET
      ---------------------------------------------------------- */
      updatedFlights = updatedFlights.map((flight) => {
        if (flight.type === 'hava-savunma') return flight;

        if (
          flight.status === 'scheduled' &&
          new Date(flight.departureTime) <= new Date()
        ) {
          const airborneCount = updatedFlights.filter(
            (f) => f.type !== 'hava-savunma' && f.status === 'enroute'
          ).length;

          if (airborneCount >= MAX_AIRBORNE_FLIGHTS) {
            // kalkışı erteleyelim
            return {
              ...flight,
              departureTime: new Date(
                Date.now() + 5 * 60 * 1000
              ).toISOString()
            };
          }

          // kalkış gerçekleşsin
          const aircraftModelData =
            aviationDatabase.aircraftModels[flight.type]?.find(
              (m) => m.model === flight.model
            );

          const initialAltitude = aircraftModelData
            ? getRandomInt(
                Math.floor(aircraftModelData.maxAltitude * 0.1),
                Math.floor(aircraftModelData.maxAltitude * 0.3)
              )
            : 5000;
          const initialSpeed = aircraftModelData
            ? getRandomInt(
                Math.floor(aircraftModelData.cruiseSpeed * 0.3),
                Math.floor(aircraftModelData.cruiseSpeed * 0.6)
              )
            : 150;

          return {
            ...flight,
            status: 'enroute',
            altitude: initialAltitude,
            speed: initialSpeed
          };
        }
        return flight;
      });

      /* ----------------------------------------------------------
         3) İNMİŞ UÇUŞLARI TEMİZLE
      ---------------------------------------------------------- */
      const cutOff = new Date(Date.now() - 30 * 60 * 1000);
      updatedFlights = updatedFlights.filter((f) => {
        if (f.type === 'hava-savunma') return true;
        if (f.status === 'landed' && new Date(f.estimatedArrivalTime) < cutOff) {
          return false;
        }
        return true;
      });

      /* ----------------------------------------------------------
         4) YENİ UÇUŞ EKLE
      ---------------------------------------------------------- */
      const regularFlights = updatedFlights.filter((f) => f.type !== 'hava-savunma');
      const airborneFlights = regularFlights.filter((f) => f.status === 'enroute');
      const scheduledFlights = regularFlights.filter((f) => f.status === 'scheduled');

      if (
        regularFlights.length < MAX_TOTAL_FLIGHTS &&
        Math.random() < 0.35
      ) {
        const newFlight = generateRandomFlight(updatedFlights);

        if (
          newFlight &&
          newFlight.type !== 'hava-savunma' &&
          !updatedFlights.find((f) => f.id === newFlight.id)
        ) {
          // havada fazla uçak varsa scheduled ekle
          if (airborneFlights.length >= MAX_AIRBORNE_FLIGHTS) {
            const delayMin = getRandomInt(5, 30);
            newFlight.status = 'scheduled';
            newFlight.departureTime = new Date(
              Date.now() + delayMin * 60 * 1000
            ).toISOString();
            newFlight.speed = 0;
            newFlight.altitude = 0;
          }
          updatedFlights.push(newFlight);
        }
      }

      /* ----------------------------------------------------------
         5) SNAPSHOT & ABONELERİ BİLGİLENDİR
      ---------------------------------------------------------- */
      currentFlightsSnapshot = updatedFlights;
      flightListeners.forEach((fn) => {
        try {
          fn(updatedFlights);
        } catch (e) {
          console.error(e);
        }
      });

      return updatedFlights;
    });
  }, []);

  /* interval */
  useEffect(() => {
    flightIntervalRef.current = setInterval(
      updateAndAddFlights,
      FLIGHT_UPDATE_INTERVAL
    );
    return () => {
      if (flightIntervalRef.current) clearInterval(flightIntervalRef.current);
    };
  }, [updateAndAddFlights]);

  /* UI yardımcı fonksiyonlar */
  const toggleStatisticsPanel = () =>
    setIsStatisticsPanelOpen((p) => !p);

  const handleAircraftClick = (flight) => {
    setSelectedFlight(flight);
    if (
      flight &&
      flight.id !== showRouteForFlightId &&
      flight.type !== 'hava-savunma'
    ) {
      setShowRouteForFlightId(flight.id);
    }
  };

  const handleCloseDetailPanel = () => setSelectedFlight(null);

  const handleToggleRouteDisplay = (flightId) =>
    setShowRouteForFlightId((p) => (p === flightId ? null : flightId));

  const handleFlightClickFromStats = (flight) => {
    const full = flights.find((f) => f.id === flight.id);
    if (full) handleAircraftClick(full);
  };

  /* ─────────── RENDER ─────────── */
  return (
    <div className="flight-control-page">
      {/* istatistik paneli butonu */}
      {ToggleStatisticsButton && (
        <div className="page-actions-overlay">
          <ToggleStatisticsButton
            isOpen={isStatisticsPanelOpen}
            onClick={toggleStatisticsPanel}
          />
        </div>
      )}

      {/* uçak ayrıntı popup */}
      <AircraftInfoPopup
        flight={selectedFlight}
        onClose={handleCloseDetailPanel}
        onToggleRoute={handleToggleRouteDisplay}
        isRouteVisible={
          !!(selectedFlight && showRouteForFlightId === selectedFlight.id)
        }
      />

      {/* Harita */}
      <div className="map-viewport-container">
        <MapViewport
          flights={flights}
          airports={AIRPORTS_DATA}
          airportLocations={AIRPORT_LOCATIONS}
          onAircraftClick={handleAircraftClick}
          selectedFlightId={selectedFlight?.id}
          routeForFlightId={showRouteForFlightId}
        />
      </div>

      {/* İstatistik paneli */}
      <div
        className={`statistics-panel-container ${
          isStatisticsPanelOpen ? 'open' : ''
        }`}
      >
        <StatisticsPanel
          flights={flights}
          onFlightClick={handleFlightClickFromStats}
        />
      </div>
    </div>
  );
};

export default FlightControlPage;