// src/components/flightcontrol/StatisticsPanel.js
import React, { useMemo, useState } from 'react';
import '../styles/StatisticsPanel.css';
import { 
  FaPlane, FaSatelliteDish, FaLayerGroup, FaTachometerAlt, 
  FaArrowsAltV, FaUserFriends, FaShieldAlt, FaStar, 
  FaBuilding, FaChartPie, FaPlaneDeparture, FaMapMarkedAlt,
  FaClock, FaFlag, FaGlobeAmericas, FaRoute, FaInfoCircle,
  FaAngleDown, FaAngleUp, FaPlaneArrival, FaExclamationTriangle
} from 'react-icons/fa';



const StatisticsPanel = ({ flights }) => {
  const [expandedStat, setExpandedStat] = useState(null);
  const [expandedItem, setExpandedItem] = useState({
    type: null,  // 'flightType' veya 'flightStatus' olabilir
    key: null    // Örn: 'sivil', 'askeri' veya 'active', 'landed' vb.
  });
  // Gelişmiş istatistik hesaplamaları
  const activeFlights = useMemo(() => 
    flights.filter(f => f.status === 'enroute' || f.status === 'active').length, 
    [flights]
  );

  const totalFlights = flights.length;

  const averageAltitude = useMemo(() => {
    const flyingFlights = flights.filter(f => 
      (f.status === 'enroute' || f.status === 'active') && f.altitude > 0
    );
    if (flyingFlights.length === 0) return 0;
    const sum = flyingFlights.reduce((acc, flight) => acc + flight.altitude, 0);
    return Math.round(sum / flyingFlights.length);
  }, [flights]);

  const averageSpeed = useMemo(() => {
    const flyingFlights = flights.filter(f => 
      (f.status === 'enroute' || f.status === 'active') && f.groundspeed > 0
    );
    if (flyingFlights.length === 0) return 0;
    const sum = flyingFlights.reduce((acc, flight) => acc + flight.groundspeed, 0);
    return Math.round(sum / flyingFlights.length);
  }, [flights]);

  const flightTypeCounts = useMemo(() => {
    const counts = {
      sivil: 0,
      askeri: 0,
      muttefik: 0,
      'hava-savunma': 0,
      vip: 0,
      diger: 0
    };
    
    flights.forEach(flight => {
      const type = flight.type?.toLowerCase() || 'diger';
      if (counts.hasOwnProperty(type)) {
        counts[type]++;
      } else {
        counts.diger++;
      }
    });
    
    return counts;
  }, [flights]);

  // Yeni istatistikler
  const flightStatusCounts = useMemo(() => {
    const counts = {
      active: 0,
      landed: 0,
      scheduled: 0,
      delayed: 0,
      other: 0
    };
    
    flights.forEach(flight => {
      const status = flight.status?.toLowerCase() || 'other';
      if (counts.hasOwnProperty(status)) {
        counts[status]++;
      } else {
        counts.other++;
      }
    });
    
    return counts;
  }, [flights]);

  const originCountries = useMemo(() => {
    const countries = {};
    flights.forEach(flight => {
      const country = flight.origin_country || 'Bilinmiyor';
      countries[country] = (countries[country] || 0) + 1;
    });
    
    // En çok uçuş olan ilk 5 ülkeyi döndür
    return Object.entries(countries)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [flights]);

  const averageDistance = useMemo(() => {
    const flightsWithDistance = flights.filter(f => f.distance);
    if (flightsWithDistance.length === 0) return 0;
    
    const sum = flightsWithDistance.reduce((acc, flight) => acc + flight.distance, 0);
    return Math.round(sum / flightsWithDistance.length);
  }, [flights]);

  const totalFlightTime = useMemo(() => {
    // Örnek hesaplama - gerçek verilere göre değiştirilmeli
    let totalMinutes = 0;
    flights.forEach(flight => {
      // Örnek: Her uçuş ortalama 30 dakika + hız/10 dakika uçuyor varsayımı
      const flightTimeMinutes = 30 + (flight.groundspeed || 0) / 10;
      totalMinutes += flightTimeMinutes;
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    
    return { hours, minutes };
  }, [flights]);

  // Detay görünümü için yardımcı veri hazırlığı
  const getDetailedData = (statType) => {
    switch(statType) {
      case 'activeFlights':
        return flights
          .filter(f => f.status === 'enroute' || f.status === 'active')
          .map(f => ({
            id: f.id || f.callsign,
            callsign: f.callsign,
            altitude: f.altitude || 'N/A',
            speed: f.groundspeed || 'N/A',
            from: f.origin || 'N/A',
            to: f.destination || 'N/A'
          }));
      
      case 'altitude':
        return flights
          .filter(f => (f.status === 'enroute' || f.status === 'active') && f.altitude > 0)
          .sort((a, b) => b.altitude - a.altitude)
          .map(f => ({
            id: f.id || f.callsign,
            callsign: f.callsign,
            altitude: f.altitude,
            type: f.type || 'Bilinmiyor'
          }));
      
      case 'speed':
        return flights
          .filter(f => (f.status === 'enroute' || f.status === 'active') && f.groundspeed > 0)
          .sort((a, b) => b.groundspeed - a.groundspeed)
          .map(f => ({
            id: f.id || f.callsign,
            callsign: f.callsign,
            speed: f.groundspeed,
            type: f.type || 'Bilinmiyor'
          }));
      
      case 'types':
        const typesDetails = {};
        Object.keys(flightTypeCounts).forEach(type => {
          typesDetails[type] = flights
            .filter(f => (f.type || '').toLowerCase() === type)
            .map(f => ({
              id: f.id || f.callsign,
              callsign: f.callsign,
              status: f.status || 'Bilinmiyor'
            }));
        });
        return typesDetails;
      
      case 'status':
        const statusDetails = {};
        Object.keys(flightStatusCounts).forEach(status => {
          statusDetails[status] = flights
            .filter(f => (f.status || '').toLowerCase() === status)
            .map(f => ({
              id: f.id || f.callsign,
              callsign: f.callsign,
              type: f.type || 'Bilinmiyor'
            }));
        });
        return statusDetails;
      
      case 'countries':
        const countriesDetails = {};
        originCountries.forEach(([country]) => {
          countriesDetails[country] = flights
            .filter(f => f.origin_country === country)
            .map(f => ({
              id: f.id || f.callsign,
              callsign: f.callsign,
              origin: f.origin || 'Bilinmiyor',
              destination: f.destination || 'Bilinmiyor'
            }));
        });
        return countriesDetails;
      
      default:
        return [];
    }
  };

  // Detay Toggle İşleyicisi (Büyük detay panelleri için)
const toggleDetail = (statName) => {
  // Büyük detay görünümü açılırken tüm öğe detaylarını kapat
  if (statName !== expandedStat) {
    setExpandedItem({ type: null, key: null }); // Herhangi bir öğe detayını kapat
  }
  
  // Mevcut statName açıksa kapat, değilse aç
  if (expandedStat === statName) {
    setExpandedStat(null);
  } else {
    setExpandedStat(statName);
  }
};

// Öğe detayları için toggle işleyici
const toggleItemDetail = (itemType, itemKey, event) => {
  // Olayın diğer işleyicilere yayılmasını engelle (parent div'e yayılmaması için)
  if (event) {
    event.stopPropagation();
  }
  
  // Öğe detayı açılırken tüm büyük detay panellerini kapat
  if (expandedItem.type !== itemType || expandedItem.key !== itemKey) {
    setExpandedStat(null); // Herhangi bir büyük detay panelini kapat
  }
  
  // Mevcut öğe detayı açıksa kapat, değilse aç
  if (expandedItem.type === itemType && expandedItem.key === itemKey) {
    setExpandedItem({ type: null, key: null });
  } else {
    setExpandedItem({ type: itemType, key: itemKey });
  }
};

  if (!flights || flights.length === 0) {
    return (
      <div className="statistics-content-wrapper">
        <div className="panel-main-title-wrapper">
          <FaChartPie className="panel-main-icon" />
          <h3 className="statistics-panel-main-title">Genel İstatistikler</h3>
        </div>
        <div className="stats-empty-container">
          <FaExclamationTriangle className="empty-icon" />
          <p className="no-data-message">Gösterilecek uçuş verisi bulunmamaktadır.</p>
          <p className="no-data-hint">Uçuş verilerini yüklemek için filtre ayarlarını kontrol edin.</p>
        </div>
      </div>
    );
  }

  // Uçak tipleri için ikon eşleştirmesi
  const typeIcons = {
    sivil: <FaPlane className="type-icon civil" />,
    askeri: <FaShieldAlt className="type-icon military" />,
    muttefik: <FaUserFriends className="type-icon ally" />,
    'hava-savunma': <FaSatelliteDish className="type-icon defense" />,
    vip: <FaStar className="type-icon vip" />,
    diger: <FaLayerGroup className="type-icon other" />
  };

  // Durum ikonları
  const statusIcons = {
    active: <FaPlaneDeparture className="status-icon active" />,
    landed: <FaPlaneArrival className="status-icon landed" />,
    scheduled: <FaClock className="status-icon scheduled" />,
    delayed: <FaExclamationTriangle className="status-icon delayed" />,
    other: <FaInfoCircle className="status-icon other" />
  };

  // Detay görünümü render fonksiyonu
  // src/components/flightcontrol/StatisticsPanel.js




const renderItemDetailView = () => {
  const { type, key } = expandedItem;
  
  if (!type || !key) return null;
  
  if (type === 'flightType') {
    // Uçak tipine göre detay görünümü
    const typeFlights = flights.filter(f => (f.type || '').toLowerCase() === key);
    
    return (
      <div className="item-detail-view">
        <div className="item-detail-header">
          {typeIcons[key] || typeIcons.diger}
          <span>{key.charAt(0).toUpperCase() + key.slice(1)} Uçakları</span>
          <div className="item-detail-close" onClick={() => setExpandedItem({ type: null, key: null })}>
            <FaAngleUp />
          </div>
        </div>
        <div className="item-detail-content">
          {typeFlights.length > 0 ? (
            <div className="item-detail-table-container">
              <table className="detail-table compact">
                <thead>
                  <tr>
                    <th>Çağrı Kodu</th>
                    <th>Durum</th>
                    <th>İrtifa</th>
                    <th>Hız</th>
                  </tr>
                </thead>
                <tbody>
                  {typeFlights.map(flight => (
                    <tr key={flight.id || flight.callsign}>
                      <td>{flight.callsign}</td>
                      <td>{flight.status || 'Bilinmiyor'}</td>
                      <td>{flight.altitude || 'N/A'}</td>
                      <td>{flight.groundspeed || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-detail-data">Bu tipte uçuş bulunmamaktadır.</p>
          )}
        </div>
      </div>
    );
  } 
  else if (type === 'flightStatus') {
    // Uçuş durumuna göre detay görünümü
    const statusFlights = flights.filter(f => (f.status || '').toLowerCase() === key);
    
    return (
      <div className="item-detail-view">
        <div className="item-detail-header">
          {statusIcons[key] || statusIcons.other}
          <span>{key.charAt(0).toUpperCase() + key.slice(1)} Durumundaki Uçuşlar</span>
          <div className="item-detail-close" onClick={() => setExpandedItem({ type: null, key: null })}>
            <FaAngleUp />
          </div>
        </div>
        <div className="item-detail-content">
          {statusFlights.length > 0 ? (
            <div className="item-detail-table-container">
              <table className="detail-table compact">
                <thead>
                  <tr>
                    <th>Çağrı Kodu</th>
                    <th>Tip</th>
                    <th>Kalkış</th>
                    <th>Varış</th>
                  </tr>
                </thead>
                <tbody>
                  {statusFlights.map(flight => (
                    <tr key={flight.id || flight.callsign}>
                      <td>{flight.callsign}</td>
                      <td>{flight.type || 'Bilinmiyor'}</td>
                      <td>{flight.origin || 'N/A'}</td>
                      <td>{flight.destination || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-detail-data">Bu durumda uçuş bulunmamaktadır.</p>
          )}
        </div>
      </div>
    );
  }
  
  return null;
};
// Detay görünümü render fonksiyonu değişiyor - kapatma düğmesi eklendi
const renderDetailView = (statType) => {
  if (!statType) return null;

  const detailedData = getDetailedData(statType);
  
  // Detay başlığını ve içeriğini hazırlayan yardımcı fonksiyon
  const getDetailContent = () => {
    switch(statType) {
      case 'activeFlights':
        return (
          <>
            <h5 className="detail-title">
              <FaPlaneDeparture /> Aktif Uçuşlar Detayı
              <div className="detail-close-btn" onClick={() => setExpandedStat(null)}>
                <FaAngleUp />
              </div>
            </h5>
            <div className="detail-table-container">
              <table className="detail-table">
                <thead>
                  <tr>
                    <th>Çağrı Kodu</th>
                    <th>İrtifa (ft)</th>
                    <th>Hız (kts)</th>
                    <th>Kalkış</th>
                    <th>Varış</th>
                  </tr>
                </thead>
                <tbody>
                  {detailedData.map(flight => (
                    <tr key={flight.id}>
                      <td>{flight.callsign}</td>
                      <td>{flight.altitude}</td>
                      <td>{flight.speed}</td>
                      <td>{flight.from}</td>
                      <td>{flight.to}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        );
      
      case 'altitude':
        return (
          <>
            <h5 className="detail-title">
              <FaArrowsAltV /> İrtifa Dağılımı Detayı
              <div className="detail-close-btn" onClick={() => setExpandedStat(null)}>
                <FaAngleUp />
              </div>
            </h5>
            <div className="detail-table-container">
              <table className="detail-table">
                <thead>
                  <tr>
                    <th>Çağrı Kodu</th>
                    <th>İrtifa (ft)</th>
                    <th>Tip</th>
                  </tr>
                </thead>
                <tbody>
                  {detailedData.map(flight => (
                    <tr key={flight.id}>
                      <td>{flight.callsign}</td>
                      <td>{flight.altitude}</td>
                      <td>{flight.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        );
      
      case 'speed':
        return (
          <>
            <h5 className="detail-title">
              <FaTachometerAlt /> Hız Dağılımı Detayı
              <div className="detail-close-btn" onClick={() => setExpandedStat(null)}>
                <FaAngleUp />
              </div>
            </h5>
            <div className="detail-table-container">
              <table className="detail-table">
                <thead>
                  <tr>
                    <th>Çağrı Kodu</th>
                    <th>Hız (kts)</th>
                    <th>Tip</th>
                  </tr>
                </thead>
                <tbody>
                  {detailedData.map(flight => (
                    <tr key={flight.id}>
                      <td>{flight.callsign}</td>
                      <td>{flight.speed}</td>
                      <td>{flight.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        );
      
      case 'types':
        return (
          <>
            <h5 className="detail-title">
              <FaLayerGroup /> Uçak Tipleri Detayı
              <div className="detail-close-btn" onClick={() => setExpandedStat(null)}>
                <FaAngleUp />
              </div>
            </h5>
            <div className="detail-tabs">
              {Object.keys(detailedData).map(type => (
                <div key={type} className="detail-tab">
                  <div className="detail-tab-header">
                    {typeIcons[type] || typeIcons.diger}
                    <span>{type.charAt(0).toUpperCase() + type.slice(1)} ({detailedData[type].length})</span>
                  </div>
                  <div className="detail-tab-content">
                    {detailedData[type].length > 0 ? (
                      <table className="detail-table compact">
                        <thead>
                          <tr>
                            <th>Çağrı Kodu</th>
                            <th>Durum</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailedData[type].map(flight => (
                            <tr key={flight.id}>
                              <td>{flight.callsign}</td>
                              <td>{flight.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="no-detail-data">Bu tipte uçuş bulunmamaktadır.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        );
        
      case 'status':
        return (
          <>
            <h5 className="detail-title">
              <FaInfoCircle /> Uçuş Durumları Detayı
              <div className="detail-close-btn" onClick={() => setExpandedStat(null)}>
                <FaAngleUp />
              </div>
            </h5>
            <div className="detail-tabs">
              {Object.keys(detailedData).map(status => (
                <div key={status} className="detail-tab">
                  <div className="detail-tab-header">
                    {statusIcons[status] || statusIcons.other}
                    <span>{status.charAt(0).toUpperCase() + status.slice(1)} ({detailedData[status].length})</span>
                  </div>
                  <div className="detail-tab-content">
                    {detailedData[status].length > 0 ? (
                      <table className="detail-table compact">
                        <thead>
                          <tr>
                            <th>Çağrı Kodu</th>
                            <th>Tip</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailedData[status].map(flight => (
                            <tr key={flight.id}>
                              <td>{flight.callsign}</td>
                              <td>{flight.type}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="no-detail-data">Bu durumda uçuş bulunmamaktadır.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        );
        
      case 'countries':
        return (
          <>
            <h5 className="detail-title">
              <FaGlobeAmericas /> Ülke Bazlı Uçuşlar
              <div className="detail-close-btn" onClick={() => setExpandedStat(null)}>
                <FaAngleUp />
              </div>
            </h5>
            <div className="detail-tabs">
              {Object.keys(detailedData).map(country => (
                <div key={country} className="detail-tab">
                  <div className="detail-tab-header">
                    <FaFlag className="country-icon" />
                    <span>{country} ({detailedData[country].length})</span>
                  </div>
                  <div className="detail-tab-content">
                    <table className="detail-table compact">
                      <thead>
                        <tr>
                          <th>Çağrı Kodu</th>
                          <th>Kalkış</th>
                          <th>Varış</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailedData[country].map(flight => (
                          <tr key={flight.id}>
                            <td>{flight.callsign}</td>
                            <td>{flight.origin}</td>
                            <td>{flight.destination}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </>
        );
      
      default:
        return (
          <>
            <h5 className="detail-title">
              <FaInfoCircle /> Detay
              <div className="detail-close-btn" onClick={() => setExpandedStat(null)}>
                <FaAngleUp />
              </div>
            </h5>
            <p>Bu istatistik için detaylı veri bulunmamaktadır.</p>
          </>
        );
    }
  };
  
  return (
    <div className="detail-view">
      {getDetailContent()}
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
        <div 
          className={`statistic-card ${expandedStat === 'activeFlights' ? 'expanded' : ''}`}
          onClick={() => toggleDetail('activeFlights')}
        >
          <div className="stat-card-icon">
            <FaPlaneDeparture />
          </div>
          <div className="stat-card-content">
            <span className="stat-value highlight">{activeFlights}</span>
            <span className="stat-label">Aktif Uçuşlar</span>
            <div className="stat-detail-toggle">
              {expandedStat === 'activeFlights' ? <FaAngleUp /> : <FaAngleDown />}
            </div>
          </div>
        </div>
        {expandedStat === 'activeFlights' && renderDetailView('activeFlights')}

        <div 
          className={`statistic-card ${expandedStat === 'totalFlights' ? 'expanded' : ''}`}
          onClick={() => toggleDetail('totalFlights')}
        >
          <div className="stat-card-icon">
            <FaLayerGroup />
          </div>
          <div className="stat-card-content">
            <span className="stat-value">{totalFlights}</span>
            <span className="stat-label">Toplam Uçuşlar</span>
            <div className="stat-detail-toggle">
              {expandedStat === 'totalFlights' ? <FaAngleUp /> : <FaAngleDown />}
            </div>
          </div>
        </div>
        {expandedStat === 'totalFlights' && renderDetailView('totalFlights')}

        <div 
          className={`statistic-card ${expandedStat === 'altitude' ? 'expanded' : ''}`}
          onClick={() => toggleDetail('altitude')}
        >
          <div className="stat-card-icon">
            <FaArrowsAltV />
          </div>
          <div className="stat-card-content">
            <span className="stat-value">{averageAltitude.toLocaleString()}</span>
            <span className="stat-label">Ort. İrtifa (ft)</span>
            <div className="stat-detail-toggle">
              {expandedStat === 'altitude' ? <FaAngleUp /> : <FaAngleDown />}
            </div>
          </div>
        </div>
        {expandedStat === 'altitude' && renderDetailView('altitude')}

        <div 
          className={`statistic-card ${expandedStat === 'speed' ? 'expanded' : ''}`}
          onClick={() => toggleDetail('speed')}
        >
          <div className="stat-card-icon">
            <FaTachometerAlt />
          </div>
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
    <div 
      className="stats-toggle-btn"
      onClick={() => toggleDetail('status')}
    >
      {expandedStat === 'status' ? <FaAngleUp /> : <FaAngleDown />}
    </div>
  </h4>
  
  <div className="status-grid">
    {Object.entries(flightStatusCounts).map(([status, count]) => (
      <div 
      key={status} 
      className={`status-item ${expandedItem.type === 'flightStatus' && expandedItem.key === status ? 'item-expanded' : ''}`}
      onClick={(e) => toggleItemDetail('flightStatus', status, e)}
    >
      {statusIcons[status] || statusIcons.other}
      <div className="status-details">
        <span className="status-label">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
        <span className="status-count">{count}</span>
      </div>
      <div className="item-detail-toggle-small">
        {expandedItem.type === 'flightStatus' && expandedItem.key === status ? <FaAngleUp /> : <FaAngleDown />}
      </div>
    </div>
    ))}
  </div>
  {Object.entries(flightStatusCounts).map(([status]) => (
    expandedItem.type === 'flightStatus' && expandedItem.key === status && 
    <div key={`detail-${status}`} className="status-item-detail-container">
      {renderItemDetailView()}
    </div>
  ))}
  {expandedStat === 'status' && renderDetailView('status')}
</div>

      <div className="stats-group secondary-stats">
        <h4 className="stats-group-title">
          <FaLayerGroup className="group-title-icon" />
          Uçak Tiplerine Göre
          <div 
            className="stats-toggle-btn"
            onClick={() => toggleDetail('types')}
          >
            {expandedStat === 'types' ? <FaAngleUp /> : <FaAngleDown />}
          </div>
        </h4>
        
        {Object.entries(flightTypeCounts).map(([type, count]) => (
          <div key={type}>
            <div 
  className={`statistic-item modern type-item ${expandedItem.type === 'flightType' && expandedItem.key === type ? 'item-expanded' : ''}`}
  onClick={(e) => toggleItemDetail('flightType', type, e)}
>
  <div className="statistic-label-icon">
    {typeIcons[type] || typeIcons.diger}
    <span style={{ textTransform: 'capitalize' }}>{type}:</span>
  </div>
  <span className="statistic-value">{count}</span>
  <div className="item-detail-toggle">
    {expandedItem.type === 'flightType' && expandedItem.key === type ? <FaAngleUp /> : <FaAngleDown />}
  </div>
</div>
            {expandedItem.type === 'flightType' && expandedItem.key === type && renderItemDetailView()}
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
            <div 
              className="stats-toggle-btn"
              onClick={() => toggleDetail('countries')}
            >
              {expandedStat === 'countries' ? <FaAngleUp /> : <FaAngleDown />}
            </div>
          </h4>
          
          <div className="countries-list">
            {originCountries.map(([country, count], index) => (
              <div className="country-item" key={country}>
                <span className="country-rank">{index + 1}</span>
                <FaFlag className="country-flag" />
                <span className="country-name">{country}</span>
                <span className="country-count">{count}</span>
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
            <div className="metric-icon">
              <FaMapMarkedAlt />
            </div>
            <div className="metric-details">
              <span className="metric-label">Ortalama Mesafe:</span>
              <span className="metric-value">{averageDistance.toLocaleString()} km</span>
            </div>
          </div>
          
          <div className="metric-item">
            <div className="metric-icon">
              <FaClock />
            </div>
            <div className="metric-details">
              <span className="metric-label">Toplam Uçuş Süresi:</span>
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