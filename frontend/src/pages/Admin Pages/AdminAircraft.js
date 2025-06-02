// pages/Admin Pages/AdminAircraft.js
import React, { useState, useEffect } from 'react';
import { aircraftService } from '../../services/api';
import '../../styles/AdminPanel.css';

const AdminAircraft = () => {
  const [aircrafts, setAircrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAircraft, setTotalAircraft] = useState(0);

  useEffect(() => {
    fetchAircraft();
  }, [currentPage, filterStatus]);

  const fetchAircraft = async () => {
    try {
      setLoading(true);
      setError('');
      const status = filterStatus === 'all' ? null : filterStatus;
      const response = await aircraftService.getAircraft(currentPage, pageSize, status);
      
      setAircrafts(response.aircrafts || []);
      setTotalPages(response.meta?.total_page || 1);
      setTotalAircraft(response.meta?.total || 0);
    } catch (err) {
      setError(err || 'Uçaklar yüklenirken bir hata oluştu');
      console.error('Error fetching aircraft:', err);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering for search
  const filteredAircrafts = aircrafts.filter(aircraft => {
    const searchLower = searchTerm.toLowerCase();
    return (
      aircraft.code?.toLowerCase().includes(searchLower) ||
      aircraft.tail_number?.toLowerCase().includes(searchLower) ||
      aircraft.model?.toLowerCase().includes(searchLower) ||
      aircraft.manufacturer?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusClass = (status) => {
    switch (status) {
      case 'ACTIVE': return 'status-completed';
      case 'MAINTENANCE': return 'status-pending';
      case 'MISSION': return 'status-in-progress';
      case 'GROUNDED': return 'status-aborted';
      case 'STANDBY': return 'status-pending';
      default: return 'status-unknown';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ACTIVE': return 'Aktif';
      case 'MAINTENANCE': return 'Bakımda';
      case 'MISSION': return 'Görevde';
      case 'GROUNDED': return 'Yerde';
      case 'STANDBY': return 'Hazır';
      default: return status;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h3>Uçaklar (Salt Okunur)</h3>
        <span className="readonly-badge">Salt Okunur Mod</span>
      </div>

      {error && (
        <div className="error-message">
          <strong>Hata:</strong> {error}
        </div>
      )}

      {/* Stats */}
      <div className="admin-stats">
        <span>Toplam Uçak: {totalAircraft}</span>
        <span>Sayfa: {currentPage} / {totalPages}</span>
        {filterStatus !== 'all' && <span>Durum: {getStatusText(filterStatus)}</span>}
        {searchTerm && <span>Arama: "{searchTerm}"</span>}
      </div>

      {/* Search and Filters */}
      <div className="admin-filters">
        <input
          type="text"
          placeholder="Uçak kodu, kuyruk no, model veya üretici ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-search"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="admin-filter"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="ACTIVE">Aktif</option>
          <option value="STANDBY">Hazır</option>
          <option value="MAINTENANCE">Bakımda</option>
          <option value="MISSION">Görevde</option>
          <option value="GROUNDED">Yerde</option>
        </select>

        <button
          onClick={() => {
            setSearchTerm('');
            setFilterStatus('all');
            setCurrentPage(1);
          }}
          className="admin-btn-secondary"
        >
          Temizle
        </button>
      </div>

      {/* Aircraft Table */}
      {loading ? (
        <div className="loading">Uçaklar yükleniyor...</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Kod</th>
                <th>Kuyruk No</th>
                <th>Model</th>
                <th>Üretici</th>
                <th>Üretim Yılı</th>
                <th>Durum</th>
                <th>Konum</th>
                <th>Son Güncelleme</th>
              </tr>
            </thead>
            <tbody>
              {filteredAircrafts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">
                    {searchTerm || filterStatus !== 'all' ? 
                      'Arama kriterlerine uygun uçak bulunamadı' : 
                      'Henüz uçak eklenmemiş'
                    }
                  </td>
                </tr>
              ) : (
                filteredAircrafts.map((aircraft) => (
                  <tr key={aircraft.id}>
                    <td>
                      <span className="aircraft-code">{aircraft.code}</span>
                    </td>
                    <td>{aircraft.tail_number}</td>
                    <td>{aircraft.model}</td>
                    <td>{aircraft.manufacturer || '-'}</td>
                    <td>{aircraft.year_manufactured || '-'}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(aircraft.status)}`}>
                        {getStatusText(aircraft.status)}
                      </span>
                    </td>
                    <td>
                      {aircraft.current_location?.name || 'Belirsiz'}
                    </td>
                    <td>{formatDateTime(aircraft.updated_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="admin-btn-secondary"
          >
            Önceki
          </button>

          <span className="pagination-info">
            Sayfa {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="admin-btn-secondary"
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminAircraft;
