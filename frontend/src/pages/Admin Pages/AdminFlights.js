import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscribeFlights } from '../FlightControlPage';   // ← yolunuzu kontrol edin
import '../../styles/AdminPanel.css';

/* ─────────  Yardımcı sözlükler  ───────── */
const STATUS_TR = {
  enroute:   'Havada',
  scheduled: 'Planlandı',
  delayed:   'Gecikmeli',
  landed:    'İndi',
  active:    'Aktif',            // hava savunma
};

const STATUS_BADGE = {
  enroute:   'status-in-progress',
  scheduled: 'status-pending',
  delayed:   'status-pending',
  landed:    'status-completed',
  active:    'status-completed',
};

const PRIORITY_TR = {
  1: 'Düşük',
  2: 'Orta',
  3: 'Yüksek',
  4: 'Kritik',
};

/* Simülasyon uçuş nesnesini tablo satırına dönüştür */
const mapFlightRow = (f) => ({
  id: f.id,
  flight_number: f.callsign,
  aircraft_model: f.model,
  route: `${f.origin} → ${f.destination}`,
  status: f.status,
  priority: f.priority ?? 2,         // simülasyonda yoksa varsayılan orta
  dep_planned: f.departureTime,
  arr_planned: f.estimatedArrivalTime,
  dep_actual:  null,
  arr_actual:  null,
  pilot: { first_name: '-', last_name: '-' }
});

/* Tarih biçimleyici */
const fmt = (d) => (d ? new Date(d).toLocaleString('tr-TR') : '-');

const AdminFlights = () => {
  const navigate = useNavigate();

  /* 1) canlı uçuş listesi */
  const [flightsRaw, setFlightsRaw] = useState([]);
  const [loading, setLoading]       = useState(true);

  /* abone ol */
  useEffect(() => {
    const unsub = subscribeFlights((fl) => {
      setFlightsRaw(fl.filter((f) => f.type !== 'hava-savunma')); // savunma sistemlerini hariç tut
      setLoading(false);
    });
    return unsub;
  }, []);

  /* 2) filtre state’i */
  const [statusFilter,   setStatusFilter]   = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [currentPage,    setCurrentPage]    = useState(1);
  const pageSize = 10;

  /* 3) uçuşları tablo satırına dönüştür */
  const flights = useMemo(
    () => flightsRaw.map(mapFlightRow),
    [flightsRaw]
  );

  /* 4) filtre uygula */
  const filtered = flights.filter((f) => {
    const matchStatus   = !statusFilter   || f.status   === statusFilter;
    const matchPriority = !priorityFilter || String(f.priority) === priorityFilter;
    return matchStatus && matchPriority;
  });

  /* 5) sayfalama */
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  /* 6) badge class fonksiyonları */
  const getStatusBadgeClass = (s) => STATUS_BADGE[s] || 'status-pending';
  const getPriorityBadgeClass = (p) =>
    ({
      1: 'priority-low',
      2: 'priority-medium',
      3: 'priority-high',
      4: 'priority-critical'
    }[p] || 'priority-low');

  /* ───────────  RENDER  ─────────── */
  return (
    <div className="admin-content">
      <div className="admin-header">
        <h3>Uçuşlar (Canlı)</h3>
        <span className="readonly-badge">Salt Okunur Mod</span>
      </div>

      {/* Özet */}
      <div className="admin-stats">
        <span>Toplam Uçuş: {flights.length}</span>
        <span>Sayfa: {currentPage}/{totalPages}</span>
        {statusFilter   && <span>Durum: {STATUS_TR[statusFilter]}</span>}
        {priorityFilter && <span>Öncelik: {PRIORITY_TR[priorityFilter]}</span>}
      </div>

      {/* Filtreler */}
      <div className="admin-filters">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="admin-filter"
        >
          <option value="">Tüm Durumlar</option>
          {Object.entries(STATUS_TR).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
          className="admin-filter"
        >
          <option value="">Tüm Öncelikler</option>
          {Object.entries(PRIORITY_TR).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <button
          className="admin-btn-secondary"
          onClick={() => { setStatusFilter(''); setPriorityFilter(''); setCurrentPage(1); }}
        >
          Filtreleri Temizle
        </button>
      </div>

      {/* Tablo ya da yükleniyor */}
      {loading ? (
        <div className="loading">Uçuşlar yükleniyor…</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Uçuş No</th>
                <th>Uçak</th>
                <th>Rota</th>
                <th>Durum</th>
                <th>Öncelik</th>
                <th>Kalkış (Plan)</th>
                <th>İniş (Plan)</th>
                <th>Detay</th>
              </tr>
            </thead>

            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">
                    {statusFilter || priorityFilter
                      ? 'Filtrelere uygun uçuş yok'
                      : 'Uçuş bulunamadı'}
                  </td>
                </tr>
              ) : (
                paged.map((f) => (
                  <tr key={f.id}>
                    <td><span className="flight-number">{f.flight_number}</span></td>
                    <td>{f.aircraft_model}</td>
                    <td>{f.route}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(f.status)}`}>
                        {STATUS_TR[f.status] || f.status}
                      </span>
                    </td>
                    <td>
                      <span className={`priority-badge ${getPriorityBadgeClass(f.priority)}`}>
                        {PRIORITY_TR[f.priority] || f.priority}
                      </span>
                    </td>
                    <td>{fmt(f.dep_planned)}</td>
                    <td>{fmt(f.arr_planned)}</td>
                    <td>
                      <button
                        className="admin-btn-small admin-btn-complete"
                        onClick={() => navigate(`/admin/flights/${f.id}`)}
                      >
                        Detay
                      </button>
                    </td>
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

export default AdminFlights;