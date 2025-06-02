import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/api';
import '../../styles/AdminUserCreate.css';

const AdminUserCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    firstName: '',
    lastName: '',
    rank: '',
    operatorCode: '',
    phone: '',
    unitId: '',
    stationId: '',
    authorityLevel: 'LOW',
    status: 'ACTIVE'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState([]);
  const [stations, setStations] = useState([]);

  useEffect(() => {
    fetchUnitsAndStations();
  }, []);

  const fetchUnitsAndStations = async () => {
    try {
      const [unitsResponse, stationsResponse] = await Promise.all([
        userService.getUnits(),
        userService.getStations()
      ]);
      setUnits(unitsResponse.units || []);
      setStations(stationsResponse.stations || []);
    } catch (err) {
      console.error('Error fetching units/stations:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Şifre kontrolü
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role
      };

      // Role için operator info gerekiyorsa ekle
      const requiresOperatorInfo = formData.role === 'operator' || formData.role === 'admin' || formData.role === 'supervisor';
      
      if (requiresOperatorInfo) {
        userData.operatorInfo = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          rank_id: 1, // Default rank ID
          operator_code: formData.operatorCode,
          phone: formData.phone,
          unit_id: parseInt(formData.unitId),
          station_id: parseInt(formData.stationId),
          authority_level: formData.authorityLevel,
          status: formData.status
        };
      }

      await userService.createUser(userData);
      alert('Kullanıcı başarıyla oluşturuldu');
      navigate('/admin/users');
    } catch (err) {
      setError(err || 'Kullanıcı oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const requiresOperatorInfo = formData.role === 'operator' || formData.role === 'admin' || formData.role === 'supervisor';

  return (
    <div className="admin-user-create">
      <div className="page-header">
        <h2>Yeni Kullanıcı Oluştur</h2>
        <button 
          onClick={() => navigate('/admin/users')} 
          className="btn-back"
        >
          ← Geri Dön
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="create-form">
        <div className="form-section">
          <h3>Temel Bilgiler</h3>
          <div className="form-group">
            <label htmlFor="username">Kullanıcı Adı*</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">E-posta*</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Şifre*</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Şifre (Tekrar)*</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Rol*</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="supervisor">Supervisor</option>
              <option value="operator">Operator</option>
            </select>
          </div>
        </div>

        {requiresOperatorInfo && (
          <>
            <div className="form-section">
              <h3>Kişisel Bilgiler</h3>
              <div className="form-group">
                <label htmlFor="firstName">Ad*</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Soyad*</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="operatorCode">Operatör Kodu*</label>
                <input
                  type="text"
                  id="operatorCode"
                  name="operatorCode"
                  value={formData.operatorCode}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Otomatik oluşturulacak, boş bırakabilirsiniz"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Telefon</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Görev Bilgileri</h3>
              <div className="form-group">
                <label htmlFor="unitId">Birim*</label>
                <select
                  id="unitId"
                  name="unitId"
                  value={formData.unitId}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Birim Seçin</option>
                  {units.map(unit => (
                    <option key={unit.unit_id} value={unit.unit_id}>
                      {unit.unit_name} ({unit.unit_code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="stationId">İstasyon*</label>
                <select
                  id="stationId"
                  name="stationId"
                  value={formData.stationId}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">İstasyon Seçin</option>
                  {stations.map(station => (
                    <option key={station.station_id} value={station.station_id}>
                      {station.station_name} ({station.station_code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="authorityLevel">Yetki Seviyesi*</label>
                <select
                  id="authorityLevel"
                  name="authorityLevel"
                  value={formData.authorityLevel}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="LOW">Düşük</option>
                  <option value="MEDIUM">Orta</option>
                  <option value="HIGH">Yüksek</option>
                  <option value="TOP">En Yüksek</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="status">Durum*</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="ACTIVE">Aktif</option>
                  <option value="INACTIVE">Pasif</option>
                  <option value="SUSPENDED">Askıya Alınmış</option>
                </select>
              </div>
            </div>
          </>
        )}

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-create"
            disabled={loading}
          >
            {loading ? 'Oluşturuluyor...' : 'Kullanıcı Oluştur'}
          </button>
          <button 
            type="button" 
            className="btn-cancel"
            onClick={() => navigate('/admin/users')}
            disabled={loading}
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminUserCreate; 