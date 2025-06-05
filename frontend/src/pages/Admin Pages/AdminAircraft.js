// src/pages/Admin Pages/AdminAircraft.js
import React, { useState, useEffect, useMemo } from 'react';
import { subscribeFlights } from '../FlightControlPage';   // path’i proje yapınıza göre ayarlayın
import '../../styles/AdminPanel.css';

// Flight nesnesini tabloya uygun “aircraft” şekline dönüştür
const mapFlightToAircraft = (flight) => {
  const statusMap = {
    enroute:   'ACTIVE',
    scheduled: 'STANDBY',
    delayed:   'MAINTENANCE',
    landed:    'GROUNDED',
    active:    'ACTIVE'
  };
  return {
    id: flight.id,
    code: flight.callsign,
    tail_number: flight.id.split('-')[0],
    model: flight.model,
    manufacturer: (flight.type || '').toUpperCase(),
    year_manufactured: '-',
    status: statusMap[flight.status] || 'UNKNOWN',
    current_location: {
      name: `${flight.latitude.toFixed(2)}, ${flight.longitude.toFixed(2)}`
    },
    updated_at: flight.estimatedArrivalTime
  };
};

// Yardımcı sözlükler
const STATUS_CLASS = {
  ACTIVE:      'status-completed',
  MAINTENANCE: 'status-pending',
  MISSION:     'status-in-progress',
  GROUNDED:    'status-aborted',
  STANDBY:     'status-pending'
};
const STATUS_TEXT = {
  ACTIVE:      'Aktif',
  MAINTENANCE: 'Bakımda',
  MISSION:     'Görevde',
  GROUNDED:    'Yerde',
  STANDBY:     'Hazır'
};
const getStatusClass = (s) => STATUS_CLASS[s] || 'status-unknown';
const getStatusText  = (s) => STATUS_TEXT[s]  || s;
const formatDate     = (d) => (d ? new Date(d).toLocaleDateString('tr-TR') : '-');

const AdminAircraft = () => {
  // FlightControlPage’ten gelen ham flight dizisi
  const [flightsRaw, setFlightsRaw] = useState([]);
  const [loading, setLoading]       = useState(true);

  // Abone ol – canlı güncellemeler gelir
  useEffect(() => {
    const unsubscribe = subscribeFlights((flights) => {
      setFlightsRaw(flights);
      setLoading(false);
    });
    return unsubscribe;          // unmount olduğunda aboneliği kes
  }, []);

  // Arama, filtre, sayfalama
  const [searchTerm,   setSearchTerm]   = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage,  setCurrentPage]  = useState(1);
  const pageSize = 10;

  // flights → aircrafts
  const aircrafts = useMemo(
    () => flightsRaw.map(mapFlightToAircraft),
    [flightsRaw]
  );

  // Arama + durum filtresi
  const filtered = aircrafts.filter((a) => {
    const s = searchTerm.toLowerCase();
    const matchSearch =
      a.code?.toLowerCase().includes(s) ||
      a.tail_number?.toLowerCase().includes(s) ||
      a.model?.toLowerCase().includes(s) ||
      a.manufacturer?.toLowerCase().includes(s);
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Sayfalama
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ---------- RENDER ----------
  return (
    <div className="admin-content">
      {/* Başlık */}
      <div className="admin-header">
        <h3>Uçaklar (Canlı)</h3>
        <span className="readonly-badge">Salt Okunur Mod</span>
      </div>

      {/* Özet istatistik */}
      <div className="admin-stats">
        <span>Toplam Uçak: {aircrafts.length}</span>
        <span>Sayfa: {currentPage}/{totalPages}</span>
        {filterStatus !== 'all' && <span>Durum: {getStatusText(filterStatus)}</span>}
        {searchTerm && <span>Arama: “{searchTerm}”</span>}
      </div>

      {/* Arama & filtre */}
      <div className="admin-filters">
        <input
          type="text"
          className="admin-search"
          placeholder="Callsign, model, üretici ara..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
        <select
          className="admin-filter"
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
        >
          <option value="all">Tüm Durumlar</option>
          <option value="ACTIVE">Aktif</option>
          <option value="STANDBY">Hazır</option>
          <option value="MAINTENANCE">Bakımda</option>
          <option value="MISSION">Görevde</option>
          <option value="GROUNDED">Yerde</option>
        </select>
        <button
          className="admin-btn-secondary"
          onClick={() => { setSearchTerm(''); setFilterStatus('all'); setCurrentPage(1); }}
        >
          Temizle
        </button>
      </div>

      {/* Tablo veya yükleniyor bildirimi */}
      {loading ? (
        <div className="loading">Uçaklar yükleniyor…</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Kod</th>
                <th>Kuyruk No</th>
                <th>Model</th>
                <th>Üretici/Tür</th>
                <th>Üretim Yılı</th>
                <th>Durum</th>
                <th>Konum</th>
                <th>Son Güncelleme</th>
              </tr>
            </thead>

            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">
                    {searchTerm || filterStatus !== 'all'
                      ? 'Kriterlere uygun kayıt bulunamadı'
                      : 'Uçuş bulunamadı'}
                  </td>
                </tr>
              ) : (
                paged.map((a) => (
                  <tr key={a.id}>
                    <td><span className="aircraft-code">{a.code}</span></td>
                    <td>{a.tail_number}</td>
                    <td>{a.model}</td>
                    <td>{a.manufacturer}</td>
                    <td>{a.year_manufactured}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(a.status)}`}>
                        {getStatusText(a.status)}
                      </span>
                    </td>
                    <td>{a.current_location.name}</td>
                    <td>{formatDate(a.updated_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <button
            className="admin-btn-secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Önceki
          </button>

          <span className="pagination-info">
            Sayfa {currentPage}/{totalPages}
          </span>

          <button
            className="admin-btn-secondary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminAircraft;