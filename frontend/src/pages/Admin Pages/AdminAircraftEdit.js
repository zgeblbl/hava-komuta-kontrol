// pages/Admin Pages/AdminAircraftEdit.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { aircraftService } from '../../services/api';
import '../../styles/AdminPanel.css';

const AdminAircraftEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
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

  useEffect(() => {
    fetchAircraft();
  }, [id]);

  const fetchAircraft = async () => {
    try {
      setLoadingData(true);
      setError('');
      const aircraft = await aircraftService.getAircraftById(id);
      
      setFormData({
        code: aircraft.code || '',
        tail_number: aircraft.tail_number || '',
        model: aircraft.model || '',
        manufacturer: aircraft.manufacturer || '',
        year_manufactured: aircraft.year_manufactured || '',
        owner: aircraft.owner || '',
        max_speed: aircraft.max_speed || '',
        cruise_speed: aircraft.cruise_speed || '',
        max_altitude: aircraft.max_altitude || '',
        range: aircraft.range || '',
        fuel_capacity: aircraft.fuel_capacity || '',
        empty_weight: aircraft.empty_weight || '',
        max_takeoff_weight: aircraft.max_takeoff_weight || '',
        status: aircraft.status || 'STANDBY'
      });
    } catch (err) {
      setError(err || 'Uçak bilgileri yüklenirken bir hata oluştu');
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.code || !formData.model) {
      setError('Uçak kodu ve model alanları zorunludur.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Convert numeric fields and prepare update data
      const aircraftData = {};
      
      if (formData.code) aircraftData.code = formData.code;
      if (formData.tail_number) aircraftData.tail_number = formData.tail_number;
      if (formData.model) aircraftData.model = formData.model;
      if (formData.manufacturer) aircraftData.manufacturer = formData.manufacturer;
      if (formData.owner) aircraftData.owner = formData.owner;
      if (formData.status) aircraftData.status = formData.status;
      
      if (formData.year_manufactured) aircraftData.year_manufactured = parseInt(formData.year_manufactured);
      if (formData.max_speed) aircraftData.max_speed = parseFloat(formData.max_speed);
      if (formData.cruise_speed) aircraftData.cruise_speed = parseFloat(formData.cruise_speed);
      if (formData.max_altitude) aircraftData.max_altitude = parseFloat(formData.max_altitude);
      if (formData.range) aircraftData.range = parseFloat(formData.range);
      if (formData.fuel_capacity) aircraftData.fuel_capacity = parseFloat(formData.fuel_capacity);
      if (formData.empty_weight) aircraftData.empty_weight = parseFloat(formData.empty_weight);
      if (formData.max_takeoff_weight) aircraftData.max_takeoff_weight = parseFloat(formData.max_takeoff_weight);

      const response = await aircraftService.updateAircraft(id, aircraftData);
      setSuccess('Uçak başarıyla güncellendi!');
      
      // 2 saniye sonra uçaklar sayfasına yönlendir
      setTimeout(() => {
        navigate('/admin/aircraft');
      }, 2000);

    } catch (err) {
      setError('Uçak güncellenirken bir hata oluştu: ' + err);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="admin-content">
        <div className="loading">Uçak bilgileri yükleniyor...</div>
      </div>
    );
  }

  if (error && !formData.code) {
    return (
      <div className="admin-content">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => navigate('/admin/aircraft')} className="admin-btn">
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h3>Uçak Düzenle - {formData.code}</h3>
        <button 
          onClick={() => navigate('/admin/aircraft')}
          className="admin-btn-secondary"
        >
          ← Geri Dön
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="plan-info">
          <div className="info-row">
            <div className="form-group">
              <label htmlFor="code">Uçak Kodu *</label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className="admin-input"
                placeholder="Örn: F16-001"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="tail_number">Kuyruk Numarası</label>
              <input
                type="text"
                id="tail_number"
                name="tail_number"
                value={formData.tail_number}
                onChange={handleInputChange}
                className="admin-input"
                placeholder="Örn: TR-001"
              />
            </div>
          </div>

          <div className="info-row">
            <div className="form-group">
              <label htmlFor="model">Model *</label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className="admin-input"
                placeholder="Örn: F-16C Block 50"
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
                placeholder="Örn: Lockheed Martin"
              />
            </div>
          </div>

          <div className="info-row">
            <div className="form-group">
              <label htmlFor="year_manufactured">Üretim Yılı</label>
              <input
                type="number"
                id="year_manufactured"
                name="year_manufactured"
                value={formData.year_manufactured}
                onChange={handleInputChange}
                className="admin-input"
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
              />
            </div>
          </div>

          <div className="info-row">
            <div className="form-group">
              <label htmlFor="max_speed">Maksimum Hız (km/h)</label>
              <input
                type="number"
                id="max_speed"
                name="max_speed"
                value={formData.max_speed}
                onChange={handleInputChange}
                className="admin-input"
                placeholder="Örn: 2414"
                min="0"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cruise_speed">Seyir Hızı (km/h)</label>
              <input
                type="number"
                id="cruise_speed"
                name="cruise_speed"
                value={formData.cruise_speed}
                onChange={handleInputChange}
                className="admin-input"
                placeholder="Örn: 850"
                min="0"
                step="0.1"
              />
            </div>
          </div>

          <div className="info-row">
            <div className="form-group">
              <label htmlFor="max_altitude">Maksimum İrtifa (feet)</label>
              <input
                type="number"
                id="max_altitude"
                name="max_altitude"
                value={formData.max_altitude}
                onChange={handleInputChange}
                className="admin-input"
                placeholder="Örn: 50000"
                min="0"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="range">Menzil (km)</label>
              <input
                type="number"
                id="range"
                name="range"
                value={formData.range}
                onChange={handleInputChange}
                className="admin-input"
                placeholder="Örn: 3220"
                min="0"
                step="0.1"
              />
            </div>
          </div>

          <div className="info-row">
            <div className="form-group">
              <label htmlFor="fuel_capacity">Yakıt Kapasitesi (L)</label>
              <input
                type="number"
                id="fuel_capacity"
                name="fuel_capacity"
                value={formData.fuel_capacity}
                onChange={handleInputChange}
                className="admin-input"
                placeholder="Örn: 3200"
                min="0"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="empty_weight">Boş Ağırlık (kg)</label>
              <input
                type="number"
                id="empty_weight"
                name="empty_weight"
                value={formData.empty_weight}
                onChange={handleInputChange}
                className="admin-input"
                placeholder="Örn: 8570"
                min="0"
                step="0.1"
              />
            </div>
          </div>

          <div className="info-row">
            <div className="form-group">
              <label htmlFor="max_takeoff_weight">Maksimum Kalkış Ağırlığı (kg)</label>
              <input
                type="number"
                id="max_takeoff_weight"
                name="max_takeoff_weight"
                value={formData.max_takeoff_weight}
                onChange={handleInputChange}
                className="admin-input"
                placeholder="Örn: 19200"
                min="0"
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
                <option value="STANDBY">Hazır</option>
                <option value="ACTIVE">Aktif</option>
                <option value="MAINTENANCE">Bakımda</option>
                <option value="MISSION">Görevde</option>
                <option value="GROUNDED">Yerde</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="admin-btn"
            disabled={loading}
          >
            {loading ? 'Güncelleniyor...' : 'Uçağı Güncelle'}
          </button>
          
          <button 
            type="button"
            onClick={() => navigate('/admin/aircraft')}
            className="admin-btn-secondary"
          >
            İptal
          </button>
        </div>
      </form>

      <div className="info-box">
        <h4>💡 Bilgi</h4>
        <ul>
          <li>Uçak kodu ve model alanları zorunludur</li>
          <li>Sadece değiştirmek istediğiniz alanları güncelleyin</li>
          <li>Boş bırakılan alanlar değiştirilmeyecektir</li>
          <li>Durum değişiklikleri dikkatli yapılmalıdır</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminAircraftEdit;
