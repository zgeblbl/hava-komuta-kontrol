import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flightService } from '../../services/api';
import '../../styles/AdminPanel.css';

const AdminFlightDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Operation modal state
  const [showOperationModal, setShowOperationModal] = useState(false);
  const [operationType, setOperationType] = useState('');
  const [operationData, setOperationData] = useState({});

  // Flight statuses and priorities
  const flightStatuses = flightService.getFlightStatuses();
  const priorityLevels = flightService.getPriorityLevels();

  useEffect(() => {
    fetchFlightDetail();
  }, [id]);

  const fetchFlightDetail = async () => {
    try {
      setLoading(true);
      setError('');
      
      const flightData = await flightService.getFlightById(id);
      setFlight(flightData);
    } catch (err) {
      console.error('Error fetching flight detail:', err);
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    return new Date(dateTimeString).toLocaleString('tr-TR');
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

  const openOperationModal = (operation) => {
    setOperationType(operation);
    setOperationData({});
    setShowOperationModal(true);
  };

  const closeOperationModal = () => {
    setShowOperationModal(false);
    setOperationType('');
    setOperationData({});
  };

  const handleStartFlight = async () => {
    try {
      setLoading(true);
      await flightService.startFlight(
        flight.id, 
        operationData.actual_departure_time || null
      );
      setSuccess('Uçuş başarıyla başlatıldı');
      closeOperationModal();
      fetchFlightDetail();
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteFlight = async () => {
    try {
      setLoading(true);
      await flightService.completeFlight(flight.id, operationData);
      setSuccess('Uçuş başarıyla tamamlandı');
      closeOperationModal();
      fetchFlightDetail();
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleCancelFlight = async () => {
    if (!operationData.reason) {
      setError('İptal nedeni gereklidir');
      return;
    }
    
    try {
      setLoading(true);
      await flightService.cancelFlight(flight.id, operationData.reason);
      setSuccess('Uçuş başarıyla iptal edildi');
      closeOperationModal();
      fetchFlightDetail();
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!operationData.status) {
      setError('Yeni durum seçilmelidir');
      return;
    }
    
    try {
      setLoading(true);
      await flightService.updateFlightStatus(
        flight.id, 
        operationData.status, 
        operationData.additional_data || {}
      );
      setSuccess('Uçuş durumu başarıyla güncellendi');
      closeOperationModal();
      fetchFlightDetail();
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFlight = async () => {
    if (!window.confirm(`${flight.flight_number} numaralı uçuşu silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!`)) {
      return;
    }

    try {
      setLoading(true);
      await flightService.deleteFlight(flight.id);
      setSuccess('Uçuş başarıyla silindi');
      setTimeout(() => {
        navigate('/admin/flights');
      }, 2000);
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  const canStartFlight = (flight) => {
    return ['PLANNED', 'SCHEDULED', 'READY'].includes(flight?.status);
  };

  const canCompleteFlight = (flight) => {
    return ['IN_FLIGHT', 'LANDING', 'LANDED'].includes(flight?.status);
  };

  const canCancelFlight = (flight) => {
    return !['COMPLETED', 'CANCELLED', 'ABORTED'].includes(flight?.status);
  };

  const canDeleteFlight = (flight) => {
    return ['PLANNED', 'SCHEDULED'].includes(flight?.status);
  };

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'CLEAR': return '☀️';
      case 'PARTLY_CLOUDY': return '⛅';
      case 'CLOUDY': return '☁️';
      case 'OVERCAST': return '🌫️';
      case 'RAIN': return '🌧️';
      case 'STORM': return '⛈️';
      case 'SNOW': return '❄️';
      case 'FOG': return '🌁';
      default: return '🌤️';
    }
  };

  const getWeatherText = (condition) => {
    switch (condition) {
      case 'CLEAR': return 'Açık';
      case 'PARTLY_CLOUDY': return 'Parçalı Bulutlu';
      case 'CLOUDY': return 'Bulutlu';
      case 'OVERCAST': return 'Kapalı';
      case 'RAIN': return 'Yağmurlu';
      case 'STORM': return 'Fırtınalı';
      case 'SNOW': return 'Karlı';
      case 'FOG': return 'Sisli';
      default: return condition;
    }
  };

  if (loading && !flight) {
    return (
      <div className="admin-content">
        <div className="loading">⏳ Uçuş detayları yükleniyor...</div>
      </div>
    );
  }

  if (error && !flight) {
    return (
      <div className="admin-content">
        <div className="error-message">
          <strong>❌ Hata:</strong> {error}
          <br />
          <button onClick={() => navigate('/admin/flights')} className="admin-btn-secondary">
            ← Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h3>✈️ Uçuş Detayları - {flight?.flight_number}</h3>
        <div className="header-actions">
          <button 
            onClick={() => navigate('/admin/flights')}
            className="admin-btn-secondary"
          >
            ← Geri Dön
          </button>
          <button 
            onClick={() => navigate(`/admin/flights/${id}/edit`)}
            className="admin-btn-secondary"
          >
            ✏️ Düzenle
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <strong>❌ Hata:</strong> {error}
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <strong>✅ Başarılı:</strong> {success}
        </div>
      )}

      {flight && (
        <div className="flight-detail-container">
          {/* Flight Status Card */}
          <div className="detail-card">
            <div className="card-header">
              <h4>📊 Uçuş Durumu</h4>
              <div className="status-info">
                <span className={`status-badge ${getStatusBadgeClass(flight.status)}`}>
                  {flightStatuses[flight.status] || flight.status}
                </span>
                <span className={`priority-badge ${getPriorityBadgeClass(flight.priority)}`}>
                  {priorityLevels[flight.priority] || flight.priority}
                </span>
              </div>
            </div>
            <div className="card-content">
              <div className="info-grid">
                <div className="info-item">
                  <label>Uçuş Numarası:</label>
                  <span className="flight-number">{flight.flight_number}</span>
                </div>
                <div className="info-item">
                  <label>Oluşturulma Tarihi:</label>
                  <span>{formatDateTime(flight.created_at)}</span>
                </div>
                <div className="info-item">
                  <label>Son Güncelleme:</label>
                  <span>{formatDateTime(flight.updated_at)}</span>
                </div>
                {flight.weather_condition && (
                  <div className="info-item">
                    <label>Hava Durumu:</label>
                    <span>
                      {getWeatherIcon(flight.weather_condition)} {getWeatherText(flight.weather_condition)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Flight Plan Card */}
          {flight.flight_plan && (
            <div className="detail-card">
              <div className="card-header">
                <h4>📋 Uçuş Planı Bilgileri</h4>
              </div>
              <div className="card-content">
                <div className="info-grid">
                  <div className="info-item">
                    <label>Plan Numarası:</label>
                    <span>{flight.flight_plan.flight_number}</span>
                  </div>
                  <div className="info-item">
                    <label>Uçak:</label>
                    <span>
                      {flight.flight_plan.aircraft?.code} ({flight.flight_plan.aircraft?.model})
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Kalkış Havaalanı:</label>
                    <span>
                      {flight.flight_plan.departure_airport?.name} ({flight.flight_plan.departure_airport?.icao_code})
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Varış Havaalanı:</label>
                    <span>
                      {flight.flight_plan.arrival_airport?.name} ({flight.flight_plan.arrival_airport?.icao_code})
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Misyon Tipi:</label>
                    <span>{flight.flight_plan.mission_type?.name}</span>
                  </div>
                  <div className="info-item">
                    <label>Planlanan Mesafe:</label>
                    <span>{flight.flight_plan.planned_distance} km</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Time Schedule Card */}
          <div className="detail-card">
            <div className="card-header">
              <h4>⏰ Zaman Çizelgesi</h4>
            </div>
            <div className="card-content">
              <div className="time-schedule">
                <div className="time-row">
                  <div className="time-type">Planlanan Kalkış:</div>
                  <div className="time-value">{formatDateTime(flight.scheduled_departure_time)}</div>
                </div>
                {flight.actual_departure_time && (
                  <div className="time-row actual">
                    <div className="time-type">Gerçek Kalkış:</div>
                    <div className="time-value">{formatDateTime(flight.actual_departure_time)}</div>
                  </div>
                )}
                <div className="time-row">
                  <div className="time-type">Planlanan Varış:</div>
                  <div className="time-value">{formatDateTime(flight.scheduled_arrival_time)}</div>
                </div>
                {flight.actual_arrival_time && (
                  <div className="time-row actual">
                    <div className="time-type">Gerçek Varış:</div>
                    <div className="time-value">{formatDateTime(flight.actual_arrival_time)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Crew Information Card */}
          <div className="detail-card">
            <div className="card-header">
              <h4>👨‍✈️ Mürettebat Bilgileri</h4>
            </div>
            <div className="card-content">
              <div className="info-grid">
                <div className="info-item">
                  <label>Ana Pilot:</label>
                  <span>
                    {flight.pilot ? 
                      `${flight.pilot.first_name} ${flight.pilot.last_name} (${flight.pilot.role})` : 
                      'Atanmamış'
                    }
                  </span>
                </div>
                <div className="info-item">
                  <label>Co-Pilot:</label>
                  <span>
                    {flight.co_pilot ? 
                      `${flight.co_pilot.first_name} ${flight.co_pilot.last_name} (${flight.co_pilot.role})` : 
                      'Atanmamış'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Flight Metrics Card */}
          {(flight.actual_fuel_used || flight.max_altitude_reached || flight.distance_traveled) && (
            <div className="detail-card">
              <div className="card-header">
                <h4>📈 Uçuş Metrikleri</h4>
              </div>
              <div className="card-content">
                <div className="metrics-grid">
                  {flight.actual_fuel_used && (
                    <div className="metric-item">
                      <div className="metric-label">Kullanılan Yakıt</div>
                      <div className="metric-value">{flight.actual_fuel_used} L</div>
                    </div>
                  )}
                  {flight.max_altitude_reached && (
                    <div className="metric-item">
                      <div className="metric-label">Maksimum İrtifa</div>
                      <div className="metric-value">{flight.max_altitude_reached} ft</div>
                    </div>
                  )}
                  {flight.distance_traveled && (
                    <div className="metric-item">
                      <div className="metric-label">Kat Edilen Mesafe</div>
                      <div className="metric-value">{flight.distance_traveled} km</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes Card */}
          {flight.notes && (
            <div className="detail-card">
              <div className="card-header">
                <h4>📝 Notlar</h4>
              </div>
              <div className="card-content">
                <div className="notes-content">
                  {flight.notes}
                </div>
              </div>
            </div>
          )}

          {/* Actions Card */}
          <div className="detail-card">
            <div className="card-header">
              <h4>🎛️ Uçuş İşlemleri</h4>
            </div>
            <div className="card-content">
              <div className="action-buttons">
                {canStartFlight(flight) && (
                  <button 
                    onClick={() => openOperationModal('start')}
                    className="admin-btn admin-btn-start"
                  >
                    🚀 Uçuş Başlat
                  </button>
                )}
                
                {canCompleteFlight(flight) && (
                  <button 
                    onClick={() => openOperationModal('complete')}
                    className="admin-btn admin-btn-complete"
                  >
                    ✅ Uçuş Tamamla
                  </button>
                )}
                
                {canCancelFlight(flight) && (
                  <button 
                    onClick={() => openOperationModal('cancel')}
                    className="admin-btn admin-btn-abort"
                  >
                    ❌ Uçuş İptal Et
                  </button>
                )}
                
                <button 
                  onClick={() => openOperationModal('status')}
                  className="admin-btn admin-btn-secondary"
                >
                  🔄 Durum Güncelle
                </button>
                
                {canDeleteFlight(flight) && (
                  <button 
                    onClick={handleDeleteFlight}
                    className="admin-btn admin-btn-delete"
                  >
                    🗑️ Uçuş Sil
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Operation Modal - Same as in AdminFlights but cleaner */}
      {showOperationModal && (
        <div className="modal-overlay" onClick={closeOperationModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {operationType === 'start' && '🚀 Uçuş Başlat'}
                {operationType === 'complete' && '✅ Uçuş Tamamla'}
                {operationType === 'cancel' && '❌ Uçuş İptal Et'}
                {operationType === 'status' && '🔄 Durum Güncelle'}
              </h3>
              <button className="close-btn" onClick={closeOperationModal}>×</button>
            </div>
            
            <div className="modal-body">
              {/* Start Flight Form */}
              {operationType === 'start' && (
                <div className="admin-form">
                  <div className="form-group">
                    <label>Gerçek Kalkış Zamanı (Opsiyonel):</label>
                    <input
                      type="datetime-local"
                      value={operationData.actual_departure_time || ''}
                      onChange={(e) => setOperationData({...operationData, actual_departure_time: e.target.value})}
                      className="admin-input"
                    />
                    <small>Boş bırakılırsa şu anki zaman kullanılır</small>
                  </div>
                </div>
              )}

              {/* Complete Flight Form */}
              {operationType === 'complete' && (
                <div className="admin-form">
                  <div className="form-group">
                    <label>Gerçek İniş Zamanı (Opsiyonel):</label>
                    <input
                      type="datetime-local"
                      value={operationData.actual_arrival_time || ''}
                      onChange={(e) => setOperationData({...operationData, actual_arrival_time: e.target.value})}
                      className="admin-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Kullanılan Yakıt (L):</label>
                    <input
                      type="number"
                      value={operationData.actual_fuel_used || ''}
                      onChange={(e) => setOperationData({...operationData, actual_fuel_used: parseFloat(e.target.value)})}
                      className="admin-input"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Maksimum İrtifa (feet):</label>
                    <input
                      type="number"
                      value={operationData.max_altitude_reached || ''}
                      onChange={(e) => setOperationData({...operationData, max_altitude_reached: parseFloat(e.target.value)})}
                      className="admin-input"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Kat Edilen Mesafe (km):</label>
                    <input
                      type="number"
                      value={operationData.distance_traveled || ''}
                      onChange={(e) => setOperationData({...operationData, distance_traveled: parseFloat(e.target.value)})}
                      className="admin-input"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Notlar:</label>
                    <textarea
                      value={operationData.notes || ''}
                      onChange={(e) => setOperationData({...operationData, notes: e.target.value})}
                      className="admin-input"
                      rows="3"
                      placeholder="Uçuş hakkında notlar..."
                    />
                  </div>
                </div>
              )}

              {/* Cancel Flight Form */}
              {operationType === 'cancel' && (
                <div className="admin-form">
                  <div className="form-group">
                    <label>İptal Nedeni *:</label>
                    <textarea
                      value={operationData.reason || ''}
                      onChange={(e) => setOperationData({...operationData, reason: e.target.value})}
                      className="admin-input"
                      rows="3"
                      placeholder="Uçuş iptal nedenini açıklayın..."
                      required
                    />
                  </div>
                </div>
              )}

              {/* Update Status Form */}
              {operationType === 'status' && (
                <div className="admin-form">
                  <div className="form-group">
                    <label>Yeni Durum *:</label>
                    <select
                      value={operationData.status || ''}
                      onChange={(e) => setOperationData({...operationData, status: e.target.value})}
                      className="admin-input"
                      required
                    >
                      <option value="">Durum Seçin</option>
                      {Object.entries(flightStatuses).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button 
                onClick={() => {
                  if (operationType === 'start') handleStartFlight();
                  else if (operationType === 'complete') handleCompleteFlight();
                  else if (operationType === 'cancel') handleCancelFlight();
                  else if (operationType === 'status') handleUpdateStatus();
                }}
                className="admin-btn"
                disabled={loading}
              >
                {loading ? '⏳ İşleniyor...' : 
                  operationType === 'start' ? '🚀 Başlat' :
                  operationType === 'complete' ? '✅ Tamamla' :
                  operationType === 'cancel' ? '❌ İptal Et' :
                  '🔄 Güncelle'
                }
              </button>
              
              <button 
                onClick={closeOperationModal}
                className="admin-btn-secondary"
                disabled={loading}
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFlightDetail; 