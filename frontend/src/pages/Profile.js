import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { userService } from '../services/api';
import { toast } from 'react-toastify';
import '../styles/Profile.css';

function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');

  // Admin kullanıcıları admin profil sayfasına yönlendir
  useEffect(() => {
    if (userRole === 'admin') {
      navigate('/admin/profile', { replace: true });
      return;
    }
  }, [userRole, navigate]);

  const [profile, setProfile] = useState({
    username: '',
    email: '',
    role: '',
    last_login: '',
    is_active: true,
    created_at: '',
    operator: null
  });

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  
  // Form data for editing
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (userRole !== 'admin') {
      loadProfile();
    }
  }, [userRole]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await userService.getProfile();
      
      setProfile({
        username: data.username || '',
        email: data.email || '',
        role: data.role || 'user',
        last_login: data.last_login || 'Hiç giriş yapılmadı',
        is_active: data.is_active !== undefined ? data.is_active : true,
        created_at: data.created_at || '',
        operator: data.operator || null
      });
      
      setFormData({
        username: data.username || '',
        email: data.email || '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      const errorMsg = error.toString();
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');

      // Validate password fields if password change is requested
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error('Yeni şifreler eşleşmiyor');
          return;
        }
        if (formData.newPassword.length < 6) {
          toast.error('Yeni şifre en az 6 karakter olmalıdır');
          return;
        }
        if (!formData.oldPassword) {
          toast.error('Şifre değiştirmek için mevcut şifrenizi girmelisiniz');
          return;
        }
      }

      const updateData = {
        username: formData.username,
        email: formData.email
      };

      // Only include password fields if password change is requested
      if (formData.newPassword) {
        updateData.oldPassword = formData.oldPassword;
        updateData.newPassword = formData.newPassword;
      }

      await userService.updateProfile(updateData);
      toast.success('Profil başarıyla güncellendi');
      setIsEditing(false);
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      // Reload profile to get updated data
      await loadProfile();
    } catch (error) {
      const errorMsg = error.toString();
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      username: profile.username,
      email: profile.email,
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
  };

  // Helper function to format authority level
  const formatAuthorityLevel = (level) => {
    switch(level) {
      case 'LOW': return 'Düşük';
      case 'MEDIUM': return 'Orta';
      case 'HIGH': return 'Yüksek';
      case 'CRITICAL': return 'Kritik';
      default: return level;
    }
  };

  // Helper function to format status
  const formatStatus = (status) => {
    switch(status) {
      case 'ACTIVE': return 'Aktif';
      case 'INACTIVE': return 'Pasif';
      case 'SUSPENDED': return 'Askıya Alınmış';
      default: return status;
    }
  };

  // Admin için hiçbir şey render etme (yönlendirme yapılıyor)
  if (userRole === 'admin') {
    return null;
  }

  if (loading && !profile.username) {
    return <div className="loading">Profil bilgileri yükleniyor...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-info">
          <div className="profile-title">
            <h1 className="profile-name">
              {profile.operator ? profile.operator.full_name : profile.username}
            </h1>
            <span className={`status-badge status-${profile.is_active ? 'active' : 'inactive'}`}>
              {profile.is_active ? 'Aktif' : 'Pasif'}
            </span>
          </div>
          <p className="profile-email">{profile.email}</p>
          <p className="profile-role">{profile.role === 'user' ? 'Kullanıcı' : profile.role}</p>
          {profile.operator && (
            <>
              <p className="profile-operator-code">Operatör Kodu: {profile.operator.operator_code}</p>
              {profile.operator.unit && (
                <p className="profile-unit">{profile.operator.unit.unit_name} ({profile.operator.unit.unit_code})</p>
              )}
              {profile.operator.station && (
                <p className="profile-station">{profile.operator.station.station_name} ({profile.operator.station.station_code})</p>
              )}
            </>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="profile-section">
          <h2 className="profile-section-title">Profil Bilgileri</h2>
          <div className="profile-form">
            <div className="form-group">
              <label htmlFor="username">Kullanıcı Adı</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleFormChange}
                disabled={!isEditing}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">E-posta Adresi</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                disabled={!isEditing}
                required
              />
            </div>
          </div>
        </div>

        {/* Operator Information Section */}
        {profile.operator && (
          <div className="profile-section">
            <h2 className="profile-section-title">Operatör Bilgileri</h2>
            <div className="profile-form operator-info-grid">
              <div className="form-group">
                <label>Ad Soyad</label>
                <input
                  type="text"
                  value={profile.operator.full_name}
                  disabled
                  className="readonly-field"
                />
              </div>

              <div className="form-group">
                <label>Operatör Kodu</label>
                <input
                  type="text"
                  value={profile.operator.operator_code}
                  disabled
                  className="readonly-field"
                />
              </div>

              <div className="form-group">
                <label>Telefon</label>
                <input
                  type="text"
                  value={profile.operator.phone || 'Belirtilmemiş'}
                  disabled
                  className="readonly-field"
                />
              </div>

              <div className="form-group">
                <label>Durum</label>
                <input
                  type="text"
                  value={formatStatus(profile.operator.status)}
                  disabled
                  className="readonly-field"
                />
              </div>

              <div className="form-group">
                <label>Yetki Seviyesi</label>
                <input
                  type="text"
                  value={formatAuthorityLevel(profile.operator.authority_level)}
                  disabled
                  className="readonly-field"
                />
              </div>

              {profile.operator.shift_start && (
                <div className="form-group">
                  <label>Vardiya</label>
                  <input
                    type="text"
                    value={`${profile.operator.shift_start} - ${profile.operator.shift_end || 'Belirtilmemiş'}`}
                    disabled
                    className="readonly-field"
                  />
                </div>
              )}

              {profile.operator.unit && (
                <>
                  <div className="form-group">
                    <label>Birim</label>
                    <input
                      type="text"
                      value={`${profile.operator.unit.unit_name} (${profile.operator.unit.unit_code})`}
                      disabled
                      className="readonly-field"
                    />
                  </div>
                  
                  {profile.operator.unit.description && (
                    <div className="form-group">
                      <label>Birim Açıklaması</label>
                      <input
                        type="text"
                        value={profile.operator.unit.description}
                        disabled
                        className="readonly-field"
                      />
                    </div>
                  )}
                </>
              )}

              {profile.operator.station && (
                <>
                  <div className="form-group">
                    <label>İstasyon</label>
                    <input
                      type="text"
                      value={`${profile.operator.station.station_name} (${profile.operator.station.station_code})`}
                      disabled
                      className="readonly-field"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Koordinatlar</label>
                    <input
                      type="text"
                      value={`${profile.operator.station.latitude}, ${profile.operator.station.longitude}`}
                      disabled
                      className="readonly-field"
                    />
                  </div>

                  <div className="form-group">
                    <label>Yükseklik</label>
                    <input
                      type="text"
                      value={`${profile.operator.station.elevation} m`}
                      disabled
                      className="readonly-field"
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Son Aktivite</label>
                <input
                  type="text"
                  value={profile.operator.last_active}
                  disabled
                  className="readonly-field"
                />
              </div>

              {profile.operator.notes && (
                <div className="form-group full-width">
                  <label>Notlar</label>
                  <textarea
                    value={profile.operator.notes}
                    disabled
                    className="readonly-field operator-notes"
                    rows="3"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {isEditing && (
          <div className="profile-section">
            <h2 className="profile-section-title">Şifre Değiştir (İsteğe Bağlı)</h2>
            <div className="profile-form">
              <div className="form-group">
                <label htmlFor="oldPassword">Mevcut Şifre</label>
                <input
                  type="password"
                  id="oldPassword"
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleFormChange}
                  placeholder="Şifre değiştirmek için mevcut şifrenizi girin"
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">Yeni Şifre</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleFormChange}
                  placeholder="En az 6 karakter"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleFormChange}
                  placeholder="Yeni şifreyi tekrar girin"
                />
              </div>
            </div>
          </div>
        )}

        <div className="profile-section">
          <h2 className="profile-section-title">Hesap Bilgileri</h2>
          <div className="profile-form">
            <div className="form-group">
              <label htmlFor="role">Yetki</label>
              <input
                type="text"
                id="role"
                name="role"
                value={profile.role === 'user' ? 'Kullanıcı' : profile.role}
                disabled
                className="readonly-field"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastLogin">Son Giriş</label>
              <input
                type="text"
                id="lastLogin"
                name="lastLogin"
                value={profile.last_login}
                disabled
                className="readonly-field"
              />
            </div>

            <div className="form-group">
              <label htmlFor="createdAt">Hesap Oluşturulma Tarihi</label>
              <input
                type="text"
                id="createdAt"
                name="createdAt"
                value={profile.created_at}
                disabled
                className="readonly-field"
              />
            </div>

            <div className="form-group">
              <label htmlFor="isActive">Hesap Durumu</label>
              <input
                type="text"
                id="isActive"
                name="isActive"
                value={profile.is_active ? 'Aktif' : 'Pasif'}
                disabled
                className="readonly-field"
              />
            </div>
          </div>
        </div>

        <div className="profile-actions">
          {isEditing ? (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                İptal
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsEditing(true)}
              disabled={loading}
            >
              Düzenle
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default Profile; 