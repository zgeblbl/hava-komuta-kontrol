import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { aircraftService } from '../../services/api';
import '../../styles/AdminPanel.css';

const AdminAircraftCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  
  const [formData, setFormData] = useState({
    code: '',
    tail_number: '',
    model: '',
    manufacturer: '',
    year_manufactured: '',
    owner: '',
    max_speed: '',
    cruise_speed: '',
    max_altitude: '',
    range: '',
    fuel_capacity: '',
    empty_weight: '',
    max_takeoff_weight: '',
    status: 'STANDBY'
  });

  // Real-time validation
  const validateField = (name, value) => {
    const errors = { ...validationErrors };
    
    switch (name) {
      case 'code':
        if (!value.trim()) {
          errors.code = 'Uçak kodu zorunludur';
        } else if (value.length < 2) {
          errors.code = 'Uçak kodu en az 2 karakter olmalıdır';
        } else if (value.length > 50) {
          errors.code = 'Uçak kodu en fazla 50 karakter olabilir';
        } else {
          delete errors.code;
        }
        break;
        
      case 'tail_number':
        if (value && value.length < 3) {
          errors.tail_number = 'Kuyruk numarası en az 3 karakter olmalıdır';
        } else if (value.length > 20) {
          errors.tail_number = 'Kuyruk numarası en fazla 20 karakter olabilir';
        } else {
          delete errors.tail_number;
        }
        break;
        
      case 'model':
        if (!value.trim()) {
          errors.model = 'Model zorunludur';
        } else if (value.length < 2) {
          errors.model = 'Model en az 2 karakter olmalıdır';
        } else if (value.length > 100) {
          errors.model = 'Model en fazla 100 karakter olabilir';
        } else {
          delete errors.model;
        }
        break;
        
      case 'year_manufactured':
        if (value && (value < 1900 || value > 2030)) {
          errors.year_manufactured = 'Üretim yılı 1900-2030 arasında olmalıdır';
        } else {
          delete errors.year_manufactured;
        }
        break;
        
      case 'max_speed':
      case 'cruise_speed':
      case 'max_altitude':
      case 'range':
      case 'fuel_capacity':
      case 'empty_weight':
      case 'max_takeoff_weight':
        if (value && value < 0) {
          errors[name] = 'Değer negatif olamaz';
        } else if (value && value > 999999) {
          errors[name] = 'Değer çok büyük';
        } else {
          delete errors[name];
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

  const validateForm = () => {
    const errors = {};
    
    // Required fields
    if (!formData.code.trim()) {
      errors.code = 'Uçak kodu zorunludur';
    } else if (formData.code.length < 2) {
      errors.code = 'Uçak kodu en az 2 karakter olmalıdır';
    }
    
    if (!formData.model.trim()) {
      errors.model = 'Model zorunludur';
    } else if (formData.model.length < 2) {
      errors.model = 'Model en az 2 karakter olmalıdır';
    }
    
    // Optional but validated fields
    if (formData.tail_number && formData.tail_number.length < 3) {
      errors.tail_number = 'Kuyruk numarası en az 3 karakter olmalıdır';
    }
    
    if (formData.year_manufactured && 
        (formData.year_manufactured < 1900 || formData.year_manufactured > 2030)) {
      errors.year_manufactured = 'Üretim yılı 1900-2030 arasında olmalıdır';
    }
    
    // Validate numeric fields
    const numericFields = ['max_speed', 'cruise_speed', 'max_altitude', 'range', 
                          'fuel_capacity', 'empty_weight', 'max_takeoff_weight'];
    
    numericFields.forEach(field => {
      if (formData[field] && formData[field] < 0) {
        errors[field] = 'Değer negatif olamaz';
      }
    });
    
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
      const aircraftData = {
        code: formData.code.trim(),
        tail_number: formData.tail_number.trim() || undefined,
        model: formData.model.trim(),
        manufacturer: formData.manufacturer.trim() || undefined,
        year_manufactured: formData.year_manufactured ? parseInt(formData.year_manufactured) : undefined,
        owner: formData.owner.trim() || undefined,
        max_speed: formData.max_speed ? parseFloat(formData.max_speed) : undefined,
        cruise_speed: formData.cruise_speed ? parseFloat(formData.cruise_speed) : undefined,
        max_altitude: formData.max_altitude ? parseFloat(formData.max_altitude) : undefined,
        range: formData.range ? parseFloat(formData.range) : undefined,
        fuel_capacity: formData.fuel_capacity ? parseFloat(formData.fuel_capacity) : undefined,
        empty_weight: formData.empty_weight ? parseFloat(formData.empty_weight) : undefined,
        max_takeoff_weight: formData.max_takeoff_weight ? parseFloat(formData.max_takeoff_weight) : undefined,
        status: formData.status
      };

      // Remove undefined fields
      Object.keys(aircraftData).forEach(key => {
        if (aircraftData[key] === undefined || aircraftData[key] === '') {
          delete aircraftData[key];
        }
      });

      console.log('Creating aircraft with data:', aircraftData);
      
      const response = await aircraftService.createAircraft(aircraftData);
      
      console.log('Aircraft created successfully:', response);
      setSuccess(`✅ ${aircraftData.code} kodlu uçak başarıyla oluşturuldu!`);
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        navigate('/admin/aircraft');
      }, 3000);

    } catch (err) {
      console.error('Aircraft creation error:', err);
      setError(err.toString());
    } finally {
      setLoading(false);
    }
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
        <h3>✈️ Yeni Uçak Ekle</h3>
        <button 
          onClick={() => navigate('/admin/aircraft')}
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
          <small>3 saniye içinde uçaklar sayfasına yönlendirileceksiniz...</small>
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="plan-info">
          {/* Temel Bilgiler */}
          <h4>📋 Temel Bilgiler</h4>
          <div className="info-row">
            <div className="form-group">
              <label htmlFor="code">
                Uçak Kodu * 
                {validationErrors.code && <span className="field-error">({validationErrors.code})</span>}
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className={`admin-input ${validationErrors.code ? 'error' : ''}`}
                placeholder="Örn: F16-001, A400M-01"
                maxLength="50"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="tail_number">
                Kuyruk Numarası
                {validationErrors.tail_number && <span className="field-error">({validationErrors.tail_number})</span>}
              </label>
              <input
                type="text"
                id="tail_number"
                name="tail_number"
                value={formData.tail_number}
                onChange={handleInputChange}
                className={`admin-input ${validationErrors.tail_number ? 'error' : ''}`}
                placeholder="Örn: TR-001, 17-0001"
                maxLength="20"
              />
            </div>
          </div>

          <div className="info-row">
            <div className="form-group">
              <label htmlFor="model">
                Model * 
                {validationErrors.model && <span className="field-error">({validationErrors.model})</span>}
              </label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className={`admin-input ${validationErrors.model ? 'error' : ''}`}
                placeholder="Örn: F-16C Block 50, A400M Atlas"
                maxLength="100"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="manufacturer">Üretici</label>
              <input
                type="text"
                id="manufacturer"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleInputChange}
                className="admin-input"
                placeholder="Örn: Lockheed Martin, Airbus"
                maxLength="100"
              />
            </div>
          </div>

          <div className="info-row">
            <div className="form-group">
              <label htmlFor="year_manufactured">
                Üretim Yılı
                {validationErrors.year_manufactured && <span className="field-error">({validationErrors.year_manufactured})</span>}
              </label>
              <input
                type="number"
                id="year_manufactured"
                name="year_manufactured"
                value={formData.year_manufactured}
                onChange={handleInputChange}
                className={`admin-input ${validationErrors.year_manufactured ? 'error' : ''}`}
                placeholder="Örn: 2010"
                min="1900"
                max="2030"
              />
            </div>

            <div className="form-group">
              <label htmlFor="owner">Sahibi</label>
              <input
                type="text"
                id="owner"
                name="owner"
                value={formData.owner}
                onChange={handleInputChange}
                className="admin-input"
                placeholder="Örn: Türk Hava Kuvvetleri"
                maxLength="100"
              />
            </div>
          </div>

          {/* Performans Bilgileri */}
          <h4>🚀 Performans Bilgileri</h4>
          <div className="info-row">
            <div className="form-group">
              <label htmlFor="max_speed">
                Maksimum Hız (km/h)
                {validationErrors.max_speed && <span className="field-error">({validationErrors.max_speed})</span>}
              </label>
              <input
                type="number"
                id="max_speed"
                name="max_speed"
                value={formData.max_speed}
                onChange={handleInputChange}
                className={`admin-input ${validationErrors.max_speed ? 'error' : ''}`}
                placeholder="Örn: 2414"
                min="0"
                max="999999"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cruise_speed">
                Seyir Hızı (km/h)
                {validationErrors.cruise_speed && <span className="field-error">({validationErrors.cruise_speed})</span>}
              </label>
              <input
                type="number"
                id="cruise_speed"
                name="cruise_speed"
                value={formData.cruise_speed}
                onChange={handleInputChange}
                className={`admin-input ${validationErrors.cruise_speed ? 'error' : ''}`}
                placeholder="Örn: 850"
                min="0"
                max="999999"
                step="0.1"
              />
            </div>
          </div>

          <div className="info-row">
            <div className="form-group">
              <label htmlFor="max_altitude">
                Maksimum İrtifa (feet)
                {validationErrors.max_altitude && <span className="field-error">({validationErrors.max_altitude})</span>}
              </label>
              <input
                type="number"
                id="max_altitude"
                name="max_altitude"
                value={formData.max_altitude}
                onChange={handleInputChange}
                className={`admin-input ${validationErrors.max_altitude ? 'error' : ''}`}
                placeholder="Örn: 50000"
                min="0"
                max="999999"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="range">
                Menzil (km)
                {validationErrors.range && <span className="field-error">({validationErrors.range})</span>}
              </label>
              <input
                type="number"
                id="range"
                name="range"
                value={formData.range}
                onChange={handleInputChange}
                className={`admin-input ${validationErrors.range ? 'error' : ''}`}
                placeholder="Örn: 3220"
                min="0"
                max="999999"
                step="0.1"
              />
            </div>
          </div>

          {/* Ağırlık ve Yakıt Bilgileri */}
          <h4>⚖️ Ağırlık ve Yakıt Bilgileri</h4>
          <div className="info-row">
            <div className="form-group">
              <label htmlFor="fuel_capacity">
                Yakıt Kapasitesi (L)
                {validationErrors.fuel_capacity && <span className="field-error">({validationErrors.fuel_capacity})</span>}
              </label>
              <input
                type="number"
                id="fuel_capacity"
                name="fuel_capacity"
                value={formData.fuel_capacity}
                onChange={handleInputChange}
                className={`admin-input ${validationErrors.fuel_capacity ? 'error' : ''}`}
                placeholder="Örn: 3200"
                min="0"
                max="999999"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="empty_weight">
                Boş Ağırlık (kg)
                {validationErrors.empty_weight && <span className="field-error">({validationErrors.empty_weight})</span>}
              </label>
              <input
                type="number"
                id="empty_weight"
                name="empty_weight"
                value={formData.empty_weight}
                onChange={handleInputChange}
                className={`admin-input ${validationErrors.empty_weight ? 'error' : ''}`}
                placeholder="Örn: 8570"
                min="0"
                max="999999"
                step="0.1"
              />
            </div>
          </div>

          <div className="info-row">
            <div className="form-group">
              <label htmlFor="max_takeoff_weight">
                Maksimum Kalkış Ağırlığı (kg)
                {validationErrors.max_takeoff_weight && <span className="field-error">({validationErrors.max_takeoff_weight})</span>}
              </label>
              <input
                type="number"
                id="max_takeoff_weight"
                name="max_takeoff_weight"
                value={formData.max_takeoff_weight}
                onChange={handleInputChange}
                className={`admin-input ${validationErrors.max_takeoff_weight ? 'error' : ''}`}
                placeholder="Örn: 19200"
                min="0"
                max="999999"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Durum</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="admin-input"
              >
                <option value="STANDBY">📍 Hazır</option>
                <option value="ACTIVE">✅ Aktif</option>
                <option value="MAINTENANCE">🔧 Bakımda</option>
                <option value="GROUNDED">⛔ Yerde</option>
                <option value="MISSION">🎯 Görevde</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="admin-btn"
            disabled={loading || Object.keys(validationErrors).length > 0}
          >
            {loading ? '⏳ Oluşturuluyor...' : '✅ Uçak Oluştur'}
          </button>
          
          <button 
            type="button"
            onClick={() => navigate('/admin/aircraft')}
            className="admin-btn-secondary"
            disabled={loading}
          >
            ❌ İptal
          </button>
        </div>
      </form>

      <div className="info-box">
        <h4>💡 Uçak Oluşturma Rehberi</h4>
        <ul>
          <li><strong>Zorunlu Alanlar:</strong> Uçak kodu ve model alanları zorunludur</li>
          <li><strong>Uçak Kodu:</strong> Benzersiz olmalı, en az 2 karakter (Örn: F16-001)</li>
          <li><strong>Kuyruk Numarası:</strong> Eğer girilirse en az 3 karakter olmalı (Örn: TR-001)</li>
          <li><strong>Üretim Yılı:</strong> 1900-2030 arasında olmalıdır</li>
          <li><strong>Sayısal Değerler:</strong> Negatif olamaz, makul sınırlar içinde olmalıdır</li>
          <li><strong>Durum:</strong> Varsayılan olarak "Hazır" durumunda oluşturulacaktır</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminAircraftCreate; 