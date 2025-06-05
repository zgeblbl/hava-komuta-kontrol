// src/components/flightcontrol/StatisticsPanel.js
import React, { useMemo, useState } from 'react';
import '../styles/StatisticsPanel.css'; // CSS dosyanızın yolu
import {
  FaPlane, FaSatelliteDish, FaLayerGroup, FaTachometerAlt,
  FaArrowsAltV, FaUserFriends, FaShieldAlt, FaStar,
  FaBuilding, FaChartPie, FaPlaneDeparture, FaMapMarkedAlt,
  FaClock, FaFlag, FaGlobeAmericas, FaRoute, FaInfoCircle,
  FaAngleDown, FaAngleUp, FaPlaneArrival, FaExclamationTriangle
} from 'react-icons/fa';

// onFlightClick prop'u FlightControlPage'den gelecek
const StatisticsPanel = ({ flights, onFlightClick }) => {
  const [expandedStat, setExpandedStat] = useState(null);
  const [expandedItem, setExpandedItem] = useState({
    type: null,  // 'flightType', 'flightStatus', 'countryOrigin' olabilir
    key: null    // Örn: 'sivil', 'askeri', 'Türkiye'
  });

  // --- İSTATİSTİK HESAPLAMALARI ---
  const activeFlights = useMemo(() =>
    flights.filter(f => 
      (f.status === 'enroute' || f.status === 'active') && 
      f.type !== 'hava-savunma'
    ).length,
    [flights]
  );

  const totalFlights = useMemo(() => 
    flights.filter(f => f.type !== 'hava-savunma').length,
    [flights]
  );

  const averageAltitude = useMemo(() => {
    const flyingFlights = flights.filter(f =>
      (f.status === 'enroute' || f.status === 'active') &&
      typeof f.altitude === 'number' && f.altitude > 0 &&
      f.type !== 'hava-savunma'
    );
    if (flyingFlights.length === 0) return 0;
    const sum = flyingFlights.reduce((acc, flight) => acc + flight.altitude, 0);
    return Math.round(sum / flyingFlights.length);
  }, [flights]);

  // Hız hesaplama - groundspeed, speed, velocity alanlarını kontrol et
  const averageSpeed = useMemo(() => {
    const flyingFlights = flights.filter(f => {
      const speed = f.groundspeed || f.speed || f.velocity || 0;
      return (f.status === 'enroute' || f.status === 'active') &&
        typeof speed === 'number' && speed > 0 && 
        f.type !== 'hava-savunma';
    });
    
    if (flyingFlights.length === 0) return 0;
    
    const sum = flyingFlights.reduce((acc, flight) => {
      const speed = flight.groundspeed || flight.speed || flight.velocity || 0;
      return acc + speed;
    }, 0);
    
    return Math.round(sum / flyingFlights.length);
  }, [flights]);

  const flightTypeCounts = useMemo(() => {
    const counts = {
      sivil: 0, askeri: 0, vip: 0, muttefik: 0, 'hava-savunma': 0, diger: 0
    };
    flights.forEach(flight => {
      const type = flight.type?.toLowerCase() || 'diger';
      if (counts.hasOwnProperty(type)) counts[type]++; else counts.diger++;
    });
    return counts;
  }, [flights]);

  const flightStatusCounts = useMemo(() => {
    const counts = {
      enroute: 0, scheduled: 0, landed: 0, delayed: 0, active: 0,
      diverted: 0, unknown: 0, other: 0
    };
    flights.forEach(flight => {
      if (flight.type === 'hava-savunma') return; // Hava savunmayı atla
      const status = flight.status?.toLowerCase() || 'other';
      if (counts.hasOwnProperty(status)) counts[status]++; else counts.other++;
    });
    return counts;
  }, [flights]);

  const originCountries = useMemo(() => {
    const countries = {};
    flights.forEach(flight => {
      if (flight.type === 'hava-savunma') return; // Hava savunmayı atla
      const country = flight.origin_country || 'Bilinmiyor';
      countries[country] = (countries[country] || 0) + 1;
    });
    return Object.entries(countries).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [flights]);

  const averageDistance = useMemo(() => {
    const flightsWithDistance = flights.filter(f =>
        typeof f.distance === 'number' && f.distance > 0 && f.type !== 'hava-savunma'
    );
    if (flightsWithDistance.length === 0) return 0;
    const sum = flightsWithDistance.reduce((acc, flight) => acc + flight.distance, 0);
    return Math.round(sum / flightsWithDistance.length);
  }, [flights]);

  const totalFlightTime = useMemo(() => {
    let totalMinutes = 0;
    flights.forEach(flight => {
      if (flight.type === 'hava-savunma') return; // Hava savunmayı atla
      if (flight.flightDurationMinutes && typeof flight.flightDurationMinutes === 'number') {
        totalMinutes += flight.flightDurationMinutes;
      } else {
        const speed = flight.groundspeed || flight.speed || flight.velocity || 0;
        const flightTimeMinutes = 30 + speed / 10;
        totalMinutes += flightTimeMinutes;
      }
    });
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return { hours, minutes };
  }, [flights]);

  // Hız verisi almak için yardımcı fonksiyon
  const getFlightSpeed = (flight) => {
    return flight.groundspeed || flight.speed || flight.velocity || 0;
  };

  const getDetailedData = (statType, filterKey = null) => {
    switch(statType) {
      case 'allFlights':
        // Sadece uçuşları göster, hava savunmayı hariç tut
        return flights.filter(f => f.type !== 'hava-savunma').map(f => ({ 
          id: f.id, 
          callsign: f.callsign, 
          model: f.model, 
          type: f.type, 
          status: f.status, 
          origin: f.origin_city || f.origin, 
          destination: f.destination_city || f.destination 
        }));
      case 'activeFlights':
        return flights.filter(f => 
          (f.status === 'enroute' || f.status === 'active') && 
          f.type !== 'hava-savunma'
        ).map(f => ({ 
          id: f.id, 
          callsign: f.callsign, 
          model: f.model, 
          altitude: f.altitude !== undefined ? f.altitude : 'N/A', 
          speed: getFlightSpeed(f) !== 0 ? getFlightSpeed(f) : 'N/A',
          from: f.origin_city || f.origin, 
          to: f.destination_city || f.destination 
        }));
      case 'altitude':
        return flights.filter(f => 
          (f.status === 'enroute' || f.status === 'active') && 
          typeof f.altitude === 'number' && f.altitude > 0 &&
          f.type !== 'hava-savunma'
        ).sort((a, b) => b.altitude - a.altitude).map(f => ({ 
          id: f.id, 
          callsign: f.callsign, 
          model: f.model, 
          altitude: f.altitude, 
          type: f.type 
        }));
      case 'speed':
        return flights.filter(f => {
          const speed = getFlightSpeed(f);
          return (f.status === 'enroute' || f.status === 'active') && 
            speed > 0 && 
            f.type !== 'hava-savunma';
        }).sort((a, b) => getFlightSpeed(b) - getFlightSpeed(a)).map(f => ({ 
          id: f.id, 
          callsign: f.callsign, 
          model: f.model, 
          speed: getFlightSpeed(f), 
          type: f.type 
        }));
      case 'types':
        // Tüm tipleri göster, hava savunma dahil
        const typesDetails = {};
        Object.keys(flightTypeCounts).forEach(typeKey => {
          typesDetails[typeKey] = flights.filter(f => (f.type?.toLowerCase() || 'diger') === typeKey).map(f => ({ 
            id: f.id, 
            callsign: f.callsign, 
            model: f.model, 
            status: f.status || 'Bilinmiyor', 
            origin: f.origin_city || f.origin, 
            destination: f.destination_city || f.destination, 
            altitude: f.altitude, 
            speed: getFlightSpeed(f) 
          }));
        });
        return typesDetails;
      case 'status':
        const statusDetails = {};
        Object.keys(flightStatusCounts).forEach(statusKey => {
          statusDetails[statusKey] = flights.filter(f => 
            (f.status?.toLowerCase() || 'diger') === statusKey && 
            f.type !== 'hava-savunma'
          ).map(f => ({ 
            id: f.id, 
            callsign: f.callsign, 
            model: f.model, 
            type: f.type || 'Bilinmiyor', 
            origin: f.origin_city || f.origin, 
            destination: f.destination_city || f.destination 
          }));
        });
        return statusDetails;
      case 'countries':
        const countriesData = {};
        originCountries.forEach(([countryName]) => {
          countriesData[countryName] = flights.filter(f => 
            f.origin_country === countryName && 
            f.type !== 'hava-savunma'
          ).map(f => ({ 
            id: f.id, 
            callsign: f.callsign, 
            model: f.model, 
            type: f.type, 
            origin: f.origin_city || f.origin, 
            destination: f.destination_city || f.destination, 
            status: f.status 
          }));
        });
        return countriesData;
      case 'countryOrigin':
        if (!filterKey) return [];
        return flights.filter(f => 
          f.origin_country === filterKey && 
          f.type !== 'hava-savunma'
        ).map(f => ({ 
          id: f.id, 
          callsign: f.callsign, 
          model: f.model, 
          type: f.type, 
          destination_city: f.destination_city || f.destination, 
          status: f.status,
          altitude: f.altitude,
          speed: getFlightSpeed(f)
        }));
      default:
        return [];
    }
  };

  const toggleDetail = (statName) => {
    if (statName !== expandedStat) setExpandedItem({ type: null, key: null });
    setExpandedStat(prev => (prev === statName ? null : statName));
  };

    const toggleItemDetail = (itemType, itemKey, event) => {
    if (event) event.stopPropagation();
    if (expandedItem.type !== itemType || expandedItem.key !== itemKey) setExpandedStat(null);
    setExpandedItem(prev => (prev.type === itemType && prev.key === itemKey ? { type: null, key: null } : { type: itemType, key: itemKey }));
  };

  if (!flights || flights.length === 0) {
    return (
      <div className="statistics-content-wrapper">
        <div className="panel-main-title-wrapper"><FaChartPie className="panel-main-icon" /><h3 className="statistics-panel-main-title">Genel İstatistikler</h3></div>
        <div className="stats-empty-container"><FaExclamationTriangle className="empty-icon" /><p className="no-data-message">Gösterilecek uçuş verisi bulunmamaktadır.</p><p className="no-data-hint">Uçuş verilerini yüklemek için filtre ayarlarını kontrol edin.</p></div>
      </div>
    );
  }

  const typeIcons = { 
    sivil: <FaPlane className="type-icon civil" />, 
    askeri: <FaShieldAlt className="type-icon military" />, 
    vip: <FaStar className="type-icon vip" />, 
    muttefik: <FaUserFriends className="type-icon ally" />, 
    'hava-savunma': <FaSatelliteDish className="type-icon defense" />,
    diger: <FaLayerGroup className="type-icon other" /> 
  };
  
  const statusIcons = { 
    active: <FaPlaneDeparture className="status-icon active" />, 
    enroute: <FaPlaneDeparture className="status-icon enroute" />, 
    landed: <FaPlaneArrival className="status-icon landed" />, 
    scheduled: <FaClock className="status-icon scheduled" />, 
    delayed: <FaExclamationTriangle className="status-icon delayed" />, 
    diverted: <FaRoute className="status-icon diverted" />, 
    unknown: <FaInfoCircle className="status-icon unknown" />, 
    other: <FaInfoCircle className="status-icon other" />, 
    diger: <FaInfoCircle className="status-icon diger" />
  };

  const renderItemDetailView = () => {
    const { type, key } = expandedItem;
    if (!type || !key) return null;

    let itemsToShow = [];
    let title = "";
    let icon = null;
    let headers = [];
    let rowRenderer = (flight) => <></>;

    if (type === 'flightType') {
      itemsToShow = getDetailedData('types')[key] || [];
      title = `${key.charAt(0).toUpperCase() + key.slice(1)} ${key === 'hava-savunma' ? 'Sistemleri' : 'Uçakları'}`;
      icon = typeIcons[key] || typeIcons.diger;
      
      // Hava savunma için özel header ve renderer
      if (key === 'hava-savunma') {
        headers = ["Çağrı Kodu", "Model", "Durum", "Konum"];
        rowRenderer = (f) => (
          <>
            <td>{f.callsign}</td>
            <td>{f.model}</td>
            <td>{f.status}</td>
            <td>{f.origin || 'N/A'}</td>
          </>
        );
      } else {
        headers = ["Çağrı Kodu", "Model", "Durum", "İrtifa (ft)", "Hız (kts)"];
        rowRenderer = (f) => (
          <>
            <td>{f.callsign}</td>
            <td>{f.model}</td>
            <td>{f.status}</td>
            <td>{f.altitude !== undefined ? f.altitude : 'N/A'}</td>
            <td>{f.speed > 0 ? f.speed : 'N/A'}</td>
          </>
        );
      }
    } else if (type === 'flightStatus') {
      itemsToShow = getDetailedData('status')[key] || [];
      title = `${key.charAt(0).toUpperCase() + key.slice(1)} Durumundaki Uçuşlar`;
      icon = statusIcons[key] || statusIcons.other;
      headers = ["Çağrı Kodu", "Model", "Tip", "Kalkış", "Varış"];
      rowRenderer = (f) => (
        <>
          <td>{f.callsign}</td>
          <td>{f.model}</td>
          <td>{f.type}</td>
          <td>{f.origin}</td>
          <td>{f.destination}</td>
        </>
      );
    } else if (type === 'countryOrigin') {
      itemsToShow = getDetailedData('countryOrigin', key);
      title = `${key} Kalkışlı Uçuşlar`;
      icon = <FaFlag className="country-icon" />;
      headers = ["Çağrı Kodu", "Model", "Tip", "Varış Şehri", "Durum", "İrtifa (ft)", "Hız (kts)"];
      rowRenderer = (f) => (
        <>
          <td>{f.callsign}</td>
          <td>{f.model}</td>
          <td>{f.type}</td>
          <td>{f.destination_city}</td>
          <td>{f.status}</td>
          <td>{f.altitude !== undefined ? f.altitude : 'N/A'}</td>
          <td>{f.speed > 0 ? f.speed : 'N/A'}</td>
        </>
      );
    }

    return (
      <div className="item-detail-view">
        <div className="item-detail-header">
          {icon} <span>{title} ({itemsToShow.length})</span>
          <div className="item-detail-close" onClick={() => setExpandedItem({ type: null, key: null })}>
            <FaAngleUp />
          </div>
        </div>
        <div className="item-detail-content">
          {itemsToShow.length > 0 ? (
            <div className="item-detail-table-container">
              <table className="detail-table compact">
                <thead>
                  <tr>{headers.map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {itemsToShow.map(flight => (
                    <tr 
                      key={flight.id} 
                      onClick={() => onFlightClick && onFlightClick(flight)} 
                      style={{ cursor: onFlightClick ? 'pointer' : 'default' }}
                    >
                      {rowRenderer(flight)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-detail-data">Bu kategoride uçuş bulunmamaktadır.</p>
          )}
        </div>
      </div>
    );
  };

  const renderDetailView = (statType) => {
    if (!statType) return null;
    const detailedDataResult = getDetailedData(statType);

    let titlePrefix = "";
    let icon = <FaInfoCircle />;
    let tableHeaders = [];
    let rowRenderer = (flight) => <></>;
    let dataToRenderAsList = null;

    if (statType === 'allFlights') {
        titlePrefix = "Tüm Uçuşlar"; icon = <FaLayerGroup />;
        tableHeaders = ["Çağrı Kodu", "Model", "Tip", "Durum", "Kalkış", "Varış"];
        rowRenderer = (f) => (
          <>
            <td>{f.callsign}</td>
            <td>{f.model}</td>
            <td>{f.type}</td>
            <td>{f.status}</td>
            <td>{f.origin}</td>
            <td>{f.destination}</td>
          </>
        );
        dataToRenderAsList = detailedDataResult;
    } else if (statType === 'activeFlights') {
        titlePrefix = "Aktif Uçuşlar"; icon = <FaPlaneDeparture />;
        tableHeaders = ["Çağrı Kodu", "Model", "İrtifa (ft)", "Hız (kts)", "Kalkış", "Varış"];
        rowRenderer = (f) => (
          <>
            <td>{f.callsign}</td>
            <td>{f.model}</td>
            <td>{f.altitude}</td>
            <td>{f.speed}</td>
            <td>{f.from}</td>
            <td>{f.to}</td>
          </>
        );
        dataToRenderAsList = detailedDataResult;
    } else if (statType === 'altitude') {
        titlePrefix = "İrtifa Dağılımı"; icon = <FaArrowsAltV />;
        tableHeaders = ["Çağrı Kodu", "Model", "Tip", "İrtifa (ft)"];
        rowRenderer = (f) => (
          <>
            <td>{f.callsign}</td>
            <td>{f.model}</td>
            <td>{f.type}</td>
            <td>{f.altitude}</td>
          </>
        );
        dataToRenderAsList = detailedDataResult;
    } else if (statType === 'speed') {
        titlePrefix = "Hız Dağılımı"; icon = <FaTachometerAlt />;
        tableHeaders = ["Çağrı Kodu", "Model", "Tip", "Hız (kts)"];
        rowRenderer = (f) => (
          <>
            <td>{f.callsign}</td>
            <td>{f.model}</td>
            <td>{f.type}</td>
            <td>{f.speed}</td>
          </>
        );
        dataToRenderAsList = detailedDataResult;
    }
    else if (statType === 'types') {
        return (
          <>
            <h5 className="detail-title">
              <FaLayerGroup /> Uçak Tipleri Detayı
              <div className="detail-close-btn" onClick={() => setExpandedStat(null)}><FaAngleUp /></div>
            </h5>
            <div className="detail-tabs">
              {Object.entries(detailedDataResult).map(([type, flightsInType]) => {
                  if (flightsInType.length === 0) return null;
                  
                  // Hava savunma için özel görünüm
                  if (type === 'hava-savunma') {
                    return (
                      <div key={type} className="detail-tab">
                        <div className="detail-tab-header">
                          {typeIcons[type] || typeIcons.diger}
                          <span>Hava Savunma Sistemleri ({flightsInType.length})</span>
                        </div>
                        <div className="detail-tab-content">
                          <table className="detail-table compact">
                            <thead>
                              <tr>
                                <th>Çağrı Kodu</th>
                                <th>Model</th>
                                <th>Durum</th>
                                <th>Konum</th>
                              </tr>
                            </thead>
                            <tbody>
                              {flightsInType.map(flight => (
                                <tr 
                                  key={flight.id} 
                                  onClick={() => onFlightClick && onFlightClick(flight)} 
                                  style={{ cursor: onFlightClick ? 'pointer' : 'default' }}
                                >
                                  <td>{flight.callsign}</td>
                                  <td>{flight.model}</td>
                                  <td>{flight.status}</td>
                                  <td>{flight.origin || 'N/A'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div key={type} className="detail-tab">
                      <div className="detail-tab-header">
                        {typeIcons[type] || typeIcons.diger}
                        <span>{type.charAt(0).toUpperCase() + type.slice(1)} ({flightsInType.length})</span>
                      </div>
                      <div className="detail-tab-content">
                        <table className="detail-table compact">
                          <thead>
                            <tr>
                              <th>Çağrı Kodu</th>
                              <th>Model</th>
                              <th>Durum</th>
                              <th>Kalkış</th>
                              <th>Varış</th>
                            </tr>
                          </thead>
                          <tbody>
                            {flightsInType.map(flight => (
                              <tr 
                                key={flight.id} 
                                onClick={() => onFlightClick && onFlightClick(flight)} 
                                style={{ cursor: onFlightClick ? 'pointer' : 'default' }}
                              >
                                <td>{flight.callsign}</td>
                                <td>{flight.model}</td>
                                <td>{flight.status}</td>
                                <td>{flight.origin}</td>
                                <td>{flight.destination}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
              })}
            </div>
          </>
        );
    } else if (statType === 'status') {
        return (
          <>
            <h5 className="detail-title">
              <FaInfoCircle /> Uçuş Durumları Detayı
              <div className="detail-close-btn" onClick={() => setExpandedStat(null)}><FaAngleUp /></div>
            </h5>
            <div className="detail-tabs">
              {Object.entries(detailedDataResult).map(([status, flightsInStatus]) => {
                  if (flightsInStatus.length === 0) return null;
                  return (
                    <div key={status} className="detail-tab">
                      <div className="detail-tab-header">
                        {statusIcons[status] || statusIcons.other}
                        <span>{status.charAt(0).toUpperCase() + status.slice(1)} ({flightsInStatus.length})</span>
                      </div>
                      <div className="detail-tab-content">
                        <table className="detail-table compact">
                          <thead>
                            <tr>
                              <th>Çağrı Kodu</th>
                              <th>Model</th>
                              <th>Tip</th>
                              <th>Kalkış</th>
                              <th>Varış</th>
                            </tr>
                          </thead>
                          <tbody>
                            {flightsInStatus.map(flight => (
                              <tr 
                                key={flight.id} 
                                onClick={() => onFlightClick && onFlightClick(flight)} 
                                style={{ cursor: onFlightClick ? 'pointer' : 'default' }}
                              >
                                <td>{flight.callsign}</td>
                                <td>{flight.model}</td>
                                <td>{flight.type}</td>
                                                                <td>{flight.origin}</td>
                                <td>{flight.destination}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
              })}
            </div>
          </>
        );
    } else if (statType === 'countries') {
        return (
          <>
            <h5 className="detail-title">
              <FaGlobeAmericas /> Ülke Bazlı Uçuşlar Detayı
              <div className="detail-close-btn" onClick={() => setExpandedStat(null)}><FaAngleUp /></div>
            </h5>
            <div className="detail-tabs">
              {Object.entries(detailedDataResult).map(([country, flightsInCountry]) => {
                if (flightsInCountry.length === 0) return null;
                return (
                    <div key={country} className="detail-tab">
                      <div className="detail-tab-header">
                        <FaFlag className="country-icon" />
                        <span>{country} ({flightsInCountry.length})</span>
                      </div>
                      <div className="detail-tab-content">
                        <table className="detail-table compact">
                          <thead>
                            <tr>
                              <th>Çağrı Kodu</th>
                              <th>Model</th>
                              <th>Tip</th>
                              <th>Varış</th>
                              <th>Durum</th>
                            </tr>
                          </thead>
                          <tbody>
                            {flightsInCountry.map(flight => (
                              <tr 
                                key={flight.id} 
                                onClick={() => onFlightClick && onFlightClick(flight)} 
                                style={{ cursor: onFlightClick ? 'pointer' : 'default' }}
                              >
                                <td>{flight.callsign}</td>
                                <td>{flight.model}</td>
                                <td>{flight.type}</td>
                                <td>{flight.destination}</td>
                                <td>{flight.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                );
              })}
            </div>
          </>
        );
    } else if (!dataToRenderAsList) {
        return (
            <div className="detail-view">
                <h5 className="detail-title">
                    <FaInfoCircle /> Detay
                    <div className="detail-close-btn" onClick={() => setExpandedStat(null)}><FaAngleUp /></div>
                </h5>
                <p>Bu istatistik için detaylı veri bulunmamaktadır.</p>
            </div>
        );
    }

    if (!dataToRenderAsList || dataToRenderAsList.length === 0) {
        return (
            <div className="detail-view">
                <h5 className="detail-title">
                  {icon} {titlePrefix} Detayı
                  <div className="detail-close-btn" onClick={() => setExpandedStat(null)}><FaAngleUp /></div>
                </h5>
                <p>Bu istatistik için detaylı veri bulunmamaktadır.</p>
            </div>
        );
    }

    return (
        <div className="detail-view">
            <h5 className="detail-title">
              {icon} {titlePrefix} Detayı ({dataToRenderAsList.length})
              <div className="detail-close-btn" onClick={() => setExpandedStat(null)}><FaAngleUp /></div>
            </h5>
            <div className="detail-table-container">
                <table className="detail-table">
                    <thead>
                      <tr>{tableHeaders.map(h => <th key={h}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {dataToRenderAsList.map(flight => (
                        <tr 
                          key={flight.id} 
                          onClick={() => onFlightClick && onFlightClick(flight)} 
                          style={{ cursor: onFlightClick ? 'pointer' : 'default' }}
                        >
                          {rowRenderer(flight)}
                        </tr>
                      ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
  };

  return (
    <div className="statistics-content-wrapper">
      <div className="panel-main-title-wrapper">
        <FaChartPie className="panel-main-icon" />
        <h3 className="statistics-panel-main-title">Genel İstatistikler</h3>
      </div>
      <div className="stats-dashboard">
        <div className="stats-group primary-stats">
          <div className={`statistic-card ${expandedStat === 'activeFlights' ? 'expanded' : ''}`} onClick={() => toggleDetail('activeFlights')}>
            <div className="stat-card-icon"><FaPlaneDeparture /></div>
            <div className="stat-card-content">
              <span className="stat-value highlight">{activeFlights}</span>
              <span className="stat-label">Aktif Uçuşlar</span>
              <div className="stat-detail-toggle">
                {expandedStat === 'activeFlights' ? <FaAngleUp /> : <FaAngleDown />}
              </div>
            </div>
          </div>
          {expandedStat === 'activeFlights' && renderDetailView('activeFlights')}

          <div className={`statistic-card ${expandedStat === 'allFlights' ? 'expanded' : ''}`} onClick={() => toggleDetail('allFlights')}>
            <div className="stat-card-icon"><FaLayerGroup /></div>
            <div className="stat-card-content">
              <span className="stat-value">{totalFlights}</span>
              <span className="stat-label">Toplam Uçuşlar</span>
              <div className="stat-detail-toggle">
                {expandedStat === 'allFlights' ? <FaAngleUp /> : <FaAngleDown />}
              </div>
            </div>
          </div>
          {expandedStat === 'allFlights' && renderDetailView('allFlights')}

          <div className={`statistic-card ${expandedStat === 'altitude' ? 'expanded' : ''}`} onClick={() => toggleDetail('altitude')}>
            <div className="stat-card-icon"><FaArrowsAltV /></div>
            <div className="stat-card-content">
              <span className="stat-value">{averageAltitude.toLocaleString()}</span>
              <span className="stat-label">Ort. İrtifa (ft)</span>
              <div className="stat-detail-toggle">
                {expandedStat === 'altitude' ? <FaAngleUp /> : <FaAngleDown />}
              </div>
            </div>
          </div>
          {expandedStat === 'altitude' && renderDetailView('altitude')}

          <div className={`statistic-card ${expandedStat === 'speed' ? 'expanded' : ''}`} onClick={() => toggleDetail('speed')}>
            <div className="stat-card-icon"><FaTachometerAlt /></div>
            <div className="stat-card-content">
              <span className="stat-value">{averageSpeed}</span>
              <span className="stat-label">Ort. Hız (kts)</span>
              <div className="stat-detail-toggle">
                {expandedStat === 'speed' ? <FaAngleUp /> : <FaAngleDown />}
              </div>
            </div>
          </div>
          {expandedStat === 'speed' && renderDetailView('speed')}
        </div>

        <div className="stats-row">
          <div className="stats-group secondary-stats">
            <h4 className="stats-group-title">
              <FaInfoCircle className="group-title-icon" />
              Uçuş Durumları
              <div className="stats-toggle-btn" onClick={() => toggleDetail('status')}>
                {expandedStat === 'status' ? <FaAngleUp /> : <FaAngleDown />}
              </div>
            </h4>
            <div className="status-grid">
              {Object.entries(flightStatusCounts).filter(([, count]) => count > 0).map(([statusKey, count]) => (
                <div 
                  key={statusKey} 
                  className={`status-item ${expandedItem.type === 'flightStatus' && expandedItem.key === statusKey ? 'item-expanded' : ''}`} 
                  onClick={(e) => toggleItemDetail('flightStatus', statusKey, e)}
                >
                  {statusIcons[statusKey] || statusIcons.other}
                  <div className="status-details">
                    <span className="status-label">{statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}</span>
                    <span className="status-count">{count}</span>
                  </div>
                  <div className="item-detail-toggle-small">
                    {expandedItem.type === 'flightStatus' && expandedItem.key === statusKey ? <FaAngleUp /> : <FaAngleDown />}
                  </div>
                </div>
              ))}
            </div>
            {expandedItem.type === 'flightStatus' && expandedItem.key && (
              <div className="status-item-detail-container">
                {renderItemDetailView()}
              </div>
            )}
            {expandedStat === 'status' && renderDetailView('status')}
          </div>

          <div className="stats-group secondary-stats">
            <h4 className="stats-group-title">
              <FaLayerGroup className="group-title-icon" />
              Uçak Tiplerine Göre
              <div className="stats-toggle-btn" onClick={() => toggleDetail('types')}>
                {expandedStat === 'types' ? <FaAngleUp /> : <FaAngleDown />}
              </div>
            </h4>
            {Object.entries(flightTypeCounts).filter(([, count]) => count > 0).map(([typeKey, count]) => (
              <div key={typeKey}>
                <div 
                  className={`statistic-item modern type-item ${expandedItem.type === 'flightType' && expandedItem.key === typeKey ? 'item-expanded' : ''}`} 
                  onClick={(e) => toggleItemDetail('flightType', typeKey, e)}
                >
                  <div className="statistic-label-icon">
                    {typeIcons[typeKey] || typeIcons.diger}
                    <span style={{ textTransform: 'capitalize' }}>
                      {typeKey === 'hava-savunma' ? 'Hava Savunma' : typeKey}:
                    </span>
                  </div>
                  <span className="statistic-value">{count}</span>
                  <div className="item-detail-toggle">
                    {expandedItem.type === 'flightType' && expandedItem.key === typeKey ? <FaAngleUp /> : <FaAngleDown />}
                  </div>
                </div>
                {expandedItem.type === 'flightType' && expandedItem.key === typeKey && renderItemDetailView()}
              </div>
            ))}
            {expandedStat === 'types' && renderDetailView('types')}
          </div>
        </div>

        <div className="stats-row">
          <div className="stats-group secondary-stats">
            <h4 className="stats-group-title">
              <FaGlobeAmericas className="group-title-icon" />
              En Çok Uçuş Olan Ülkeler
              <div className="stats-toggle-btn" onClick={() => toggleDetail('countries')}>
                {expandedStat === 'countries' ? <FaAngleUp /> : <FaAngleDown />}
              </div>
            </h4>
            <div className="countries-list">
              {originCountries.map(([country, count], index) => (
                <div key={country}>
                  <div
                    className={`country-item ${expandedItem.type === 'countryOrigin' && expandedItem.key === country ? 'item-expanded' : ''}`}
                    onClick={(e) => toggleItemDetail('countryOrigin', country, e)}
                    style={{cursor: 'pointer'}}
                  >
                    <span className="country-rank">{index + 1}</span>
                    <FaFlag className="country-flag" />
                    <span className="country-name">{country}</span>
                    <span className="country-count">{count}</span>
                    <div className="item-detail-toggle" style={{marginLeft: 'auto', opacity: (expandedItem.type === 'countryOrigin' && expandedItem.key === country) ? 1: 0.7}}>
                      {expandedItem.type === 'countryOrigin' && expandedItem.key === country ? <FaAngleUp /> : <FaAngleDown />}
                    </div>
                  </div>
                  {/* Ülke detayı hemen altında render edilecek */}
                  {expandedItem.type === 'countryOrigin' && expandedItem.key === country && (
                    <div className="country-item-detail-container">
                      {renderItemDetailView()}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {expandedStat === 'countries' && renderDetailView('countries')}
          </div>

          <div className="stats-group secondary-stats">
            <h4 className="stats-group-title">
              <FaRoute className="group-title-icon" />
              Ek Uçuş Metrikleri
            </h4>
            <div className="metric-item">
              <div className="metric-icon"><FaMapMarkedAlt /></div>
              <div className="metric-details">
                <span className="metric-label">Ortalama Mesafe:</span>
                <span className="metric-value">{averageDistance.toLocaleString()} nm</span>
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-icon"><FaClock /></div>
              <div className="metric-details">
                <span className="metric-label">Toplam Uçuş Süresi (Tahmini):</span>
                <span className="metric-value">{totalFlightTime.hours} saat {totalFlightTime.minutes} dk</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPanel;