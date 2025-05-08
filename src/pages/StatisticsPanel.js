import React, { useMemo } from 'react';
import '../styles/StatisticsPanel.css'; // CSS importu
// İkonlar için react-icons gibi bir kütüphane kullanabilirsiniz veya basit metin/emoji
// import { FaPlane, FaTachometerAlt, FaArrowsAltV } from 'react-icons/fa';

const StatisticsPanel = ({ flights }) => {
  const activeFlights = useMemo(() => flights.filter(f => f.status === 'enroute' || f.status === 'active').length, [flights]);
  const totalFlights = flights.length;

  const averageAltitude = useMemo(() => {
    const enrouteFlights = flights.filter(f => f.status === 'enroute' && typeof f.altitude === 'number');
    if (enrouteFlights.length === 0) return 0;
    const totalAlt = enrouteFlights.reduce((sum, f) => sum + f.altitude, 0);
    return Math.round(totalAlt / enrouteFlights.length);
  }, [flights]);

  const averageSpeed = useMemo(() => {
    const enrouteFlights = flights.filter(f => f.status === 'enroute' && typeof f.speed === 'number');
    if (enrouteFlights.length === 0) return 0;
    const totalSpeed = enrouteFlights.reduce((sum, f) => sum + f.speed, 0);
    return Math.round(totalSpeed / enrouteFlights.length);
  }, [flights]);

  // Uçak tiplerine göre sayım (örnek)
  const flightTypeCounts = useMemo(() => {
    return flights.reduce((counts, flight) => {
      counts[flight.type] = (counts[flight.type] || 0) + 1;
      return counts;
    }, {});
  }, [flights]);

  if (!flights || flights.length === 0) {
    return (
      // Bu durumda da wrapper class'ını eklemek tutarlı olur
      <div className="statistics-content-wrapper"> 
        <h3 className="statistics-panel-title">
          ✈️ İstatistikler
        </h3>
        <p>Gösterilecek uçuş verisi bulunmamaktadır.</p>
      </div>
    );
  }

  return (
    <div className="statistics-panel-container">
      <h3 className="statistics-panel-title">
        {/* <FaPlane className="icon" /> */} ✈️ İstatistikler
      </h3>
      <div className="statistic-item">
        <span className="statistic-label">Aktif Uçuşlar:</span>
        <span className="statistic-value">{activeFlights}</span>
      </div>
      <div className="statistic-item">
        <span className="statistic-label">Toplam Görüntülenen:</span>
        <span className="statistic-value">{totalFlights}</span>
      </div>
      <div className="statistic-item">
        <span className="statistic-label">Ort. İrtifa (Havada):</span>
        <span className="statistic-value">{averageAltitude.toLocaleString()} ft</span>
      </div>
      <div className="statistic-item">
        <span className="statistic-label">Ort. Hız (Havada):</span>
        <span className="statistic-value">{averageSpeed} kts</span>
      </div>

      <h4 style={{ marginTop: 'var(--spacing-lg)', marginBottom: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>
        Uçak Tipleri:
      </h4>
      {Object.entries(flightTypeCounts).map(([type, count]) => (
        <div className="statistic-item" key={type}>
          <span className="statistic-label" style={{textTransform: 'capitalize'}}>{type}:</span>
          <span className="statistic-value">{count}</span>
        </div>
      ))}

      {/* İleride grafikler eklenebilir */}
      {/* <div className="chart-container">
        <p>İrtifa Dağılım Grafiği (Yakında)</p>
      </div> */}
    </div>
  );
};

export default StatisticsPanel;