// pages/Admin Pages/AdminUserEdit.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../../services/api';
import '../../styles/AdminUserEdit.css';

const AdminUserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    role: '',
    is_active: true,
    operator: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [units, setUnits] = useState([]);
  const [stations, setStations] = useState([]);

  useEffect(() => {
    fetchUserData();
    fetchUnitsAndStations();
  }, [id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const user = await userService.getUserById(id);
      setUserData(user);
    } catch (err) {
      setError(err || 'Kullanıcı bilgileri alınamadı');
    } finally {
      setLoading(false);
    }
  };

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
    const { name, value, type, checked } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOperatorChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      operator: {
        ...prev.operator,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      // Prepare user data update
      const updateData = {
        username: userData.username,
        email: userData.email,
        role: userData.role,
        is_active: userData.is_active
      };

      // Update user data
      await userService.updateUser(id, updateData);
      
      // Update operator data if it exists
      if (userData.operator && userData.operator.id) {
        const operatorData = {
          first_name: userData.operator.first_name,
          last_name: userData.operator.last_name,
          phone: userData.operator.phone,
          // Include other operator fields that can be updated
        };
        
        try {
          await userService.updateOperator(userData.operator.id, operatorData);
        } catch (operatorErr) {
          console.error('Error updating operator:', operatorErr);
          // Continue even if operator update fails
        }
      }
      
      alert('Kullanıcı başarıyla güncellendi');
      navigate(`/admin/users/${id}`);
    } catch (err) {
      setError(err || 'Kullanıcı güncellenirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-user-edit">
        <div className="loading">Kullanıcı bilgileri yükleniyor...</div>
      </div>
    );
  }

  if (error && !userData.id) {
    return (
      <div className="admin-user-edit">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => navigate('/admin/users')} className="btn-back">
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  const requiresOperatorInfo = userData.role === 'operator' || userData.role === 'admin' || userData.role === 'supervisor';

  return (
    <div className="admin-user-edit">
      <div className="page-header">
        <h2>Kullanıcıyı Düzenle</h2>
        <button 
          onClick={() => navigate(`/admin/users/${id}`)} 
          className="btn-back"
        >
          ← Geri Dön
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="edit-form">
        <div className="form-section">
          <h3>Temel Bilgiler</h3>
          
          <div className="form-group">
            <label htmlFor="username">Kullanıcı Adı*</label>
            <input
              type="text"
              id="username"
              name="username"
              value={userData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">E-posta*</label>
            <input
              type="email"
              id="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Rol*</label>
            <select
              id="role"
              name="role"
              value={userData.role}
              onChange={handleChange}
              required
            >
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="supervisor">Supervisor</option>
              <option value="operator">Operator</option>
            </select>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_active"
                checked={userData.is_active}
                onChange={handleChange}
              />
              Aktif Kullanıcı
            </label>
          </div>
        </div>

        {requiresOperatorInfo && userData.operator && (
          <div className="form-section">
            <h3>Operatör Bilgileri</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">Ad</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={userData.operator.first_name || ''}
                  onChange={handleOperatorChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="last_name">Soyad</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={userData.operator.last_name || ''}
                  onChange={handleOperatorChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="operator_code">Operatör Kodu</label>
                <input
                  type="text"
                  id="operator_code"
                  name="operator_code"
                  value={userData.operator.operator_code || ''}
                  onChange={handleOperatorChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Telefon</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={userData.operator.phone || ''}
                  onChange={handleOperatorChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="unit_id">Birim</label>
                <select
                  id="unit_id"
                  name="unit_id"
                  value={userData.operator.unit_id || ''}
                  onChange={handleOperatorChange}
                >
                  <option value="">Birim Seçin</option>
                  {units.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {unit.unit_name} ({unit.unit_code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="station_id">İstasyon</label>
                <select
                  id="station_id"
                  name="station_id"
                  value={userData.operator.station_id || ''}
                  onChange={handleOperatorChange}
                >
                  <option value="">İstasyon Seçin</option>
                  {stations.map(station => (
                    <option key={station.id} value={station.id}>
                      {station.station_name} ({station.station_code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="authority_level">Yetki Seviyesi</label>
              <select
                id="authority_level"
                name="authority_level"
                value={userData.operator.authority_level || ''}
                onChange={handleOperatorChange}
              >
                <option value="">Yetki Seviyesi Seçin</option>
                <option value="L1">L1 - Temel</option>
                <option value="L2">L2 - Standart</option>
                <option value="L3">L3 - Gelişmiş</option>
                <option value="L4">L4 - Yönetici</option>
                <option value="L5">L5 - Süpervizör</option>
              </select>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-save"
            disabled={saving}
          >
            {saving ? 'Kaydediliyor...' : 'Kullanıcıyı Güncelle'}
          </button>
          <button 
            type="button" 
            className="btn-cancel"
            onClick={() => navigate(`/admin/users/${id}`)}
            disabled={saving}
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminUserEdit;
