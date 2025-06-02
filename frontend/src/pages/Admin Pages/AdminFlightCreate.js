import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { flightService, flightPlanService, userService } from '../../services/api';
import '../../styles/AdminPanel.css';

const AdminFlightCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  
  // Form data
  const [formData, setFormData] = useState({
    flight_number: '',
    flight_plan_id: '',
    pilot_id: '',
    co_pilot_id: '',
    scheduled_departure_time: '',
    scheduled_arrival_time: '',
    priority: 1,
    weather_condition: '',
    notes: ''
  });

  // Options data
  const [flightPlans, setFlightPlans] = useState([]);
  const [pilots, setPilots] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  
  // Flight statuses and priorities
  const priorityLevels = flightService.getPriorityLevels();

  useEffect(() => {
    fetchOptions();
    generateFlightNumber();
  }, []);

  const fetchOptions = async () => {
    try {
      setLoadingOptions(true);
      
      // Get approved flight plans
      const flightPlansResponse = await flightPlanService.getFlightPlans(1, 100, 'APPROVED');
      setFlightPlans(flightPlansResponse.flight_plans || []);
      
      // Get pilots (users with pilot role)
      const usersResponse = await userService.getUsers(1, 100);
      const pilotUsers = (usersResponse.users || []).filter(user => 
        user.role === 'PILOT' || user.role === 'OPERATOR'
      );
      setPilots(pilotUsers);
      
    } catch (err) {
      console.error('Error fetching options:', err);
      setError('Seçenekler yüklenirken hata oluştu: ' + err.toString());
    } finally {
      setLoadingOptions(false);
    }
  };

  const generateFlightNumber = () => {
    const prefix = 'FLT';
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${prefix}${timestamp}${randomNum}`;
  };

  // Real-time validation
  const validateField = (name, value) => {
    const errors = { ...validationErrors };
    
    switch (name) {
      case 'flight_number':
        if (!value.trim()) {
          errors.flight_number = 'Uçuş numarası zorunludur';
        } else if (value.length < 3) {
          errors.flight_number = 'Uçuş numarası en az 3 karakter olmalıdır';
        } else if (value.length > 20) {
          errors.flight_number = 'Uçuş numarası en fazla 20 karakter olabilir';
        } else {
          delete errors.flight_number;
        }
        break;
        
      case 'flight_plan_id':
        if (!value) {
          errors.flight_plan_id = 'Uçuş planı seçimi zorunludur';
        } else {
          delete errors.flight_plan_id;
        }
        break;
        
      case 'priority':
        if (value < 1 || value > 4) {
          errors.priority = 'Öncelik 1-4 arasında olmalıdır';
        } else {
          delete errors.priority;
        }
        break;
        
      case 'scheduled_departure_time':
        if (value && formData.scheduled_arrival_time && new Date(value) >= new Date(formData.scheduled_arrival_time)) {
          errors.scheduled_departure_time = 'Kalkış zamanı varış zamanından önce olmalıdır';
        } else {
          delete errors.scheduled_departure_time;
        }
        break;
        
      case 'scheduled_arrival_time':
        if (value && formData.scheduled_departure_time && new Date(formData.scheduled_departure_time) >= new Date(value)) {
          errors.scheduled_arrival_time = 'Varış zamanı kalkış zamanından sonra olmalıdır';
        } else {
          delete errors.scheduled_arrival_time;
        }
        break;
        
      default:
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear general errors when user starts typing
    setError('');
    setSuccess('');
    
    // Real-time validation
    validateField(name, value);
  };

  const handleFlightPlanChange = (e) => {
    const planId = e.target.value;
    setFormData(prev => ({
      ...prev,
      flight_plan_id: planId
    }));
    
    // Auto-fill scheduled times if available
    if (planId) {
      const selectedPlan = flightPlans.find(plan => plan.id === parseInt(planId));
      if (selectedPlan) {
        setFormData(prev => ({
          ...prev,
          flight_plan_id: planId,
          scheduled_departure_time: selectedPlan.planned_departure_time || '',
          scheduled_arrival_time: selectedPlan.planned_arrival_time || ''
        }));
      }
    }
    
    validateField('flight_plan_id', planId);
  };

  const validateForm = () => {
    const errors = {};
    
    // Required fields
    if (!formData.flight_number.trim()) {
      errors.flight_number = 'Uçuş numarası zorunludur';
    } else if (formData.flight_number.length < 3) {
      errors.flight_number = 'Uçuş numarası en az 3 karakter olmalıdır';
    }
    
    if (!formData.flight_plan_id) {
      errors.flight_plan_id = 'Uçuş planı seçimi zorunludur';
    }
    
    // Priority validation
    if (formData.priority < 1 || formData.priority > 4) {
      errors.priority = 'Öncelik 1-4 arasında olmalıdır';
    }
    
    // Time validation
    if (formData.scheduled_departure_time && formData.scheduled_arrival_time) {
      if (new Date(formData.scheduled_departure_time) >= new Date(formData.scheduled_arrival_time)) {
        errors.scheduled_departure_time = 'Kalkış zamanı varış zamanından önce olmalıdır';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      setError('Lütfen form hatalarını düzeltin.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Prepare data for submission
      const flightData = {
        flight_number: formData.flight_number.trim(),
        flight_plan_id: parseInt(formData.flight_plan_id),
        pilot_id: formData.pilot_id ? parseInt(formData.pilot_id) : null,
        co_pilot_id: formData.co_pilot_id ? parseInt(formData.co_pilot_id) : null,
        scheduled_departure_time: formData.scheduled_departure_time || null,
        scheduled_arrival_time: formData.scheduled_arrival_time || null,
        priority: parseInt(formData.priority),
        weather_condition: formData.weather_condition.trim() || null,
        notes: formData.notes.trim() || null
      };

      // Remove null fields
      Object.keys(flightData).forEach(key => {
        if (flightData[key] === null || flightData[key] === '') {
          delete flightData[key];
        }
      });

      console.log('Creating flight with data:', flightData);
      
      const response = await flightService.createFlight(flightData);
      
      console.log('Flight created successfully:', response);
      setSuccess(`✅ ${flightData.flight_number} numaralı uçuş başarıyla oluşturuldu!`);
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        navigate('/admin/flights');
      }, 3000);

    } catch (err) {
      console.error('Flight creation error:', err);
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  const getSelectedFlightPlan = () => {
    if (!formData.flight_plan_id) return null;
    return flightPlans.find(plan => plan.id === parseInt(formData.flight_plan_id));
  };

  // Clear messages after 10 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h3>✈️ Yeni Uçuş Oluştur</h3>
        <button 
          onClick={() => navigate('/admin/flights')}
          className="admin-btn-secondary"
        >
          ← Geri Dön
        </button>
      </div>

      {error && (
        <div className="error-message">
          <strong>❌ Hata:</strong> {error}
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <strong>✅ Başarılı:</strong> {success}
          <br />
          <small>3 saniye içinde uçuşlar sayfasına yönlendirileceksiniz...</small>
        </div>
      )}

      {loadingOptions ? (
        <div className="loading">⏳ Seçenekler yükleniyor...</div>
      ) : (
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="plan-info">
            {/* Temel Bilgiler */}
            <h4>📋 Temel Bilgiler</h4>
            <div className="info-row">
              <div className="form-group">
                <label htmlFor="flight_number">
                  Uçuş Numarası * 
                  {validationErrors.flight_number && <span className="field-error">({validationErrors.flight_number})</span>}
                </label>
                <input
                  type="text"
                  id="flight_number"
                  name="flight_number"
                  value={formData.flight_number}
                  onChange={handleInputChange}
                  className={`admin-input ${validationErrors.flight_number ? 'error' : ''}`}
                  placeholder="Örn: FLT001, THY123"
                  maxLength="20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({...prev, flight_number: generateFlightNumber()}))}
                  className="admin-btn-secondary"
                  style={{ marginTop: '0.5rem' }}
                >
                  🎲 Otomatik Oluştur
                </button>
              </div>

              <div className="form-group">
                <label htmlFor="flight_plan_id">
                  Uçuş Planı * 
                  {validationErrors.flight_plan_id && <span className="field-error">({validationErrors.flight_plan_id})</span>}
                </label>
                <select
                  id="flight_plan_id"
                  name="flight_plan_id"
                  value={formData.flight_plan_id}
                  onChange={handleFlightPlanChange}
                  className={`admin-input ${validationErrors.flight_plan_id ? 'error' : ''}`}
                  required
                >
                  <option value="">Uçuş Planı Seçin</option>
                  {flightPlans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.flight_number} - {plan.aircraft?.code} ({plan.departure_airport?.name} → {plan.arrival_airport?.name})
                    </option>
                  ))}
                </select>
                {flightPlans.length === 0 && (
                  <small style={{ color: '#ff7b00' }}>
                    ⚠️ Onaylanmış uçuş planı bulunamadı. Önce bir uçuş planı oluşturun ve onaylayın.
                  </small>
                )}
              </div>
            </div>

            {/* Selected Flight Plan Details */}
            {getSelectedFlightPlan() && (
              <div className="plan-details" style={{ marginTop: '1rem' }}>
                <h4>📄 Seçilen Uçuş Planı Detayları</h4>
                <div className="plan-info">
                  <div className="info-row">
                    <label>Plan Numarası:</label>
                    <span>{getSelectedFlightPlan().flight_number}</span>
                  </div>
                  <div className="info-row">
                    <label>Uçak:</label>
                    <span>{getSelectedFlightPlan().aircraft?.code} ({getSelectedFlightPlan().aircraft?.model})</span>
                  </div>
                  <div className="info-row">
                    <label>Kalkış:</label>
                    <span>{getSelectedFlightPlan().departure_airport?.name}</span>
                  </div>
                  <div className="info-row">
                    <label>Varış:</label>
                    <span>{getSelectedFlightPlan().arrival_airport?.name}</span>
                  </div>
                  <div className="info-row">
                    <label>Misyon Tipi:</label>
                    <span>{getSelectedFlightPlan().mission_type?.name}</span>
                  </div>
                  <div className="info-row">
                    <label>Planlanan Mesafe:</label>
                    <span>{getSelectedFlightPlan().planned_distance} km</span>
                  </div>
                </div>
              </div>
            )}

            {/* Pilot Bilgileri */}
            <h4>👨‍✈️ Pilot Atamaları</h4>
            <div className="info-row">
              <div className="form-group">
                <label htmlFor="pilot_id">Ana Pilot</label>
                <select
                  id="pilot_id"
                  name="pilot_id"
                  value={formData.pilot_id}
                  onChange={handleInputChange}
                  className="admin-input"
                >
                  <option value="">Pilot Seçin</option>
                  {pilots.map(pilot => (
                    <option key={pilot.id} value={pilot.id}>
                      {pilot.first_name} {pilot.last_name} ({pilot.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="co_pilot_id">Co-Pilot</label>
                <select
                  id="co_pilot_id"
                  name="co_pilot_id"
                  value={formData.co_pilot_id}
                  onChange={handleInputChange}
                  className="admin-input"
                >
                  <option value="">Co-Pilot Seçin</option>
                  {pilots.filter(pilot => pilot.id !== parseInt(formData.pilot_id)).map(pilot => (
                    <option key={pilot.id} value={pilot.id}>
                      {pilot.first_name} {pilot.last_name} ({pilot.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Zamanlama */}
            <h4>⏰ Zamanlama</h4>
            <div className="info-row">
              <div className="form-group">
                <label htmlFor="scheduled_departure_time">
                  Planlanan Kalkış Zamanı
                  {validationErrors.scheduled_departure_time && <span className="field-error">({validationErrors.scheduled_departure_time})</span>}
                </label>
                <input
                  type="datetime-local"
                  id="scheduled_departure_time"
                  name="scheduled_departure_time"
                  value={formData.scheduled_departure_time}
                  onChange={handleInputChange}
                  className={`admin-input ${validationErrors.scheduled_departure_time ? 'error' : ''}`}
                />
              </div>

              <div className="form-group">
                <label htmlFor="scheduled_arrival_time">
                  Planlanan Varış Zamanı
                  {validationErrors.scheduled_arrival_time && <span className="field-error">({validationErrors.scheduled_arrival_time})</span>}
                </label>
                <input
                  type="datetime-local"
                  id="scheduled_arrival_time"
                  name="scheduled_arrival_time"
                  value={formData.scheduled_arrival_time}
                  onChange={handleInputChange}
                  className={`admin-input ${validationErrors.scheduled_arrival_time ? 'error' : ''}`}
                />
              </div>
            </div>

            {/* Öncelik ve Koşullar */}
            <h4>⚡ Öncelik ve Koşullar</h4>
            <div className="info-row">
              <div className="form-group">
                <label htmlFor="priority">
                  Öncelik Seviyesi
                  {validationErrors.priority && <span className="field-error">({validationErrors.priority})</span>}
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className={`admin-input ${validationErrors.priority ? 'error' : ''}`}
                >
                  {Object.entries(priorityLevels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {value === '1' && '🟢 '}
                      {value === '2' && '🟡 '}
                      {value === '3' && '🟠 '}
                      {value === '4' && '🔴 '}
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="weather_condition">Hava Durumu</label>
                <select
                  id="weather_condition"
                  name="weather_condition"
                  value={formData.weather_condition}
                  onChange={handleInputChange}
                  className="admin-input"
                >
                  <option value="">Hava Durumu Seçin</option>
                  <option value="CLEAR">☀️ Açık</option>
                  <option value="PARTLY_CLOUDY">⛅ Parçalı Bulutlu</option>
                  <option value="CLOUDY">☁️ Bulutlu</option>
                  <option value="OVERCAST">🌫️ Kapalı</option>
                  <option value="RAIN">🌧️ Yağmurlu</option>
                  <option value="STORM">⛈️ Fırtınalı</option>
                  <option value="SNOW">❄️ Karlı</option>
                  <option value="FOG">🌁 Sisli</option>
                </select>
              </div>
            </div>

            {/* Notlar */}
            <h4>📝 Notlar</h4>
            <div className="form-group">
              <label htmlFor="notes">Ek Notlar</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="admin-input"
                rows="4"
                placeholder="Uçuş hakkında özel notlar, talimatlar veya dikkat edilmesi gereken hususlar..."
                maxLength="1000"
              />
              <small>{formData.notes.length}/1000 karakter</small>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="admin-btn"
              disabled={loading || Object.keys(validationErrors).length > 0 || !formData.flight_number || !formData.flight_plan_id}
            >
              {loading ? '⏳ Oluşturuluyor...' : '✅ Uçuş Oluştur'}
            </button>
            
            <button 
              type="button"
              onClick={() => navigate('/admin/flights')}
              className="admin-btn-secondary"
              disabled={loading}
            >
              ❌ İptal
            </button>
          </div>
        </form>
      )}

      <div className="info-box">
        <h4>💡 Uçuş Oluşturma Rehberi</h4>
        <ul>
          <li><strong>Uçuş Planı:</strong> Sadece onaylanmış uçuş planları seçilebilir</li>
          <li><strong>Uçuş Numarası:</strong> Benzersiz olmalı, en az 3 karakter</li>
          <li><strong>Pilot Atama:</strong> Opsiyonel, daha sonra da atanabilir</li>
          <li><strong>Zamanlama:</strong> Kalkış zamanı varış zamanından önce olmalı</li>
          <li><strong>Öncelik:</strong> 1=Düşük, 2=Orta, 3=Yüksek, 4=Kritik</li>
          <li><strong>Durum:</strong> Yeni uçuşlar varsayılan olarak "Planlandı" durumunda oluşturulur</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminFlightCreate; 