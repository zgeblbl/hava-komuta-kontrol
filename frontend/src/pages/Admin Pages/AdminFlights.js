import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { flightService } from '../../services/api';
import '../../styles/AdminPanel.css';

const AdminFlights = () => {
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFlights, setTotalFlights] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Flight statuses and priorities
  const flightStatuses = flightService.getFlightStatuses();
  const priorityLevels = flightService.getPriorityLevels();

  useEffect(() => {
    fetchFlights();
  }, [currentPage, statusFilter, priorityFilter]);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await flightService.getFlights(
        currentPage, 
        10, 
        statusFilter || null, 
        priorityFilter || null
      );
      
      setFlights(response.flights || []);
      setTotalPages(response.meta.total_page);
      setTotalFlights(response.meta.total);
    } catch (err) {
      console.error('Error fetching flights:', err);
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePriorityFilterChange = (e) => {
    setPriorityFilter(e.target.value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setStatusFilter('');
    setPriorityFilter('');
    setCurrentPage(1);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PLANNED':
      case 'SCHEDULED':
        return 'status-pending';
      case 'IN_FLIGHT':
      case 'TAXIING':
      case 'TAKEOFF':
        return 'status-in-progress';
      case 'COMPLETED':
        return 'status-completed';
      case 'CANCELLED':
      case 'ABORTED':
      case 'EMERGENCY':
        return 'status-aborted';
      default:
        return 'status-pending';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 1:
        return 'priority-low';
      case 2:
        return 'priority-medium';
      case 3:
        return 'priority-high';
      case 4:
        return 'priority-critical';
      default:
        return 'priority-low';
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    return new Date(dateTimeString).toLocaleString('tr-TR');
  };

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h3>Uçuşlar (Salt Okunur)</h3>
        <span className="readonly-badge">Salt Okunur Mod</span>
      </div>

      {error && (
        <div className="error-message">
          <strong>Hata:</strong> {error}
        </div>
      )}

      {/* Stats */}
      <div className="admin-stats">
        <span>Toplam Uçuş: {totalFlights}</span>
        <span>Sayfa: {currentPage} / {totalPages}</span>
        {statusFilter && <span>Durum: {flightStatuses[statusFilter]}</span>}
        {priorityFilter && <span>Öncelik: {priorityLevels[priorityFilter]}</span>}
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <select 
          value={statusFilter} 
          onChange={handleStatusFilterChange}
          className="admin-filter"
        >
          <option value="">Tüm Durumlar</option>
          {Object.entries(flightStatuses).map(([key, value]) => (
            <option key={key} value={key}>{value}</option>
          ))}
        </select>

        <select 
          value={priorityFilter} 
          onChange={handlePriorityFilterChange}
          className="admin-filter"
        >
          <option value="">Tüm Öncelikler</option>
          {Object.entries(priorityLevels).map(([key, value]) => (
            <option key={key} value={key}>{value}</option>
          ))}
        </select>

        <button 
          onClick={resetFilters}
          className="admin-btn-secondary"
        >
          Filtreleri Temizle
        </button>
      </div>

      {/* Flights Table */}
      {loading ? (
        <div className="loading">Uçuşlar yükleniyor...</div>
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
                <th>Kalkış</th>
                <th>İniş</th>
                <th>Pilot</th>
                <th>Detaylar</th>
              </tr>
            </thead>
            <tbody>
              {flights.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data">
                    {statusFilter || priorityFilter ? 
                      'Filtrelere uygun uçuş bulunamadı' : 
                      'Henüz uçuş oluşturulmamış'
                    }
                  </td>
                </tr>
              ) : (
                flights.map((flight) => (
                  <tr key={flight.id}>
                    <td>
                      <span className="flight-number">{flight.flight_number}</span>
                    </td>
                    <td>
                      {flight.flight_plan?.aircraft?.code || '-'}
                    </td>
                    <td>
                      {flight.flight_plan?.departure_airport?.name} → {flight.flight_plan?.arrival_airport?.name}
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(flight.status)}`}>
                        {flightStatuses[flight.status] || flight.status}
                      </span>
                    </td>
                    <td>
                      <span className={`priority-badge ${getPriorityBadgeClass(flight.priority)}`}>
                        {priorityLevels[flight.priority] || flight.priority}
                      </span>
                    </td>
                    <td>
                      <div>
                        <small>Plan: {formatDateTime(flight.scheduled_departure_time)}</small>
                        {flight.actual_departure_time && (
                          <div><strong>Gerçek: {formatDateTime(flight.actual_departure_time)}</strong></div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div>
                        <small>Plan: {formatDateTime(flight.scheduled_arrival_time)}</small>
                        {flight.actual_arrival_time && (
                          <div><strong>Gerçek: {formatDateTime(flight.actual_arrival_time)}</strong></div>
                        )}
                      </div>
                    </td>
                    <td>
                      {flight.pilot?.first_name} {flight.pilot?.last_name}
                      {flight.co_pilot && (
                        <div><small>Co-pilot: {flight.co_pilot.first_name} {flight.co_pilot.last_name}</small></div>
                      )}
                    </td>
                    <td>
                      <button 
                        onClick={() => navigate(`/admin/flights/${flight.id}`)}
                        className="admin-btn-small admin-btn-complete"
                        title="Detayları Görüntüle"
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

export default AdminFlights; 