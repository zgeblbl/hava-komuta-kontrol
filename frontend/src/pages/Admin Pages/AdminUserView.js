// pages/Admin Pages/AdminUserView.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { userService } from '../../services/api';
import '../../styles/AdminUserEdit.css'; // Reuse the edit styles

const AdminUserView = () => {
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
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserData();
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

  const handleDeleteUser = async () => {
    const confirmMessage = `"${userData.username}" kullanıcısını silmek istediğinizden emin misiniz?

Bu işlem aşağıdaki verileri kalıcı olarak silecek:
• Kullanıcı hesabı ve profil bilgileri
• Operatör bilgileri (varsa)
• Oturum geçmişi
• Sistem log kayıtları

Bu işlem GERİ ALINAMAZ!`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);
      
      // Call the API to delete the user
      await userService.deleteUser(id);
      
      // Success message
      alert(`${userData.username} kullanıcısı ve tüm bağlantılı verileri başarıyla silindi.`);
      
      // Navigate back to users list
      navigate('/admin/users');
    } catch (err) {
      console.error('Delete user error:', err);
      setError(`Kullanıcı silinirken bir hata oluştu: ${err}`);
      alert(`Kullanıcı silinirken bir hata oluştu: ${err}`);
    } finally {
      setLoading(false);
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

  const formatDate = (dateString) => {
    if (!dateString || dateString === '0001-01-01T00:00:00Z') return 'Hiç giriş yapılmamış';
    return new Date(dateString).toLocaleString('tr-TR');
  };

  return (
    <div className="admin-user-edit">
      <div className="page-header">
        <h2>Kullanıcı Detayları</h2>
        <button 
          onClick={() => navigate('/admin/users')} 
          className="btn-back"
        >
          ← Geri Dön
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="view-container">
        <div className="form-section">
          <h3>Temel Bilgiler</h3>
          
          <div className="view-group">
            <label>Kullanıcı Adı:</label>
            <div className="view-value">{userData.username}</div>
          </div>

          <div className="view-group">
            <label>E-posta:</label>
            <div className="view-value">{userData.email}</div>
          </div>

          <div className="view-group">
            <label>Rol:</label>
            <div className="view-value">
              <span className={`status-badge ${userData.role === 'ADMIN' ? 'status-in-progress' : 'status-pending'}`}>
                {userData.role === 'ADMIN' ? 'Admin' : userData.role}
              </span>
            </div>
          </div>

          <div className="view-group">
            <label>Durum:</label>
            <div className="view-value">
              <span className={`status-badge ${userData.is_active ? 'status-completed' : 'status-aborted'}`}>
                {userData.is_active ? 'Aktif' : 'Pasif'}
              </span>
            </div>
          </div>

          <div className="view-group">
            <label>Oluşturulma Tarihi:</label>
            <div className="view-value">{formatDate(userData.created_at)}</div>
          </div>

          <div className="view-group">
            <label>Son Giriş:</label>
            <div className="view-value">{formatDate(userData.last_login)}</div>
          </div>
        </div>

        {userData.operator && (
          <div className="form-section">
            <h3>Operatör Bilgileri</h3>
            
            <div className="view-group">
              <label>Ad Soyad:</label>
              <div className="view-value">
                {userData.operator.first_name} {userData.operator.last_name}
              </div>
            </div>

            <div className="view-group">
              <label>Operatör Kodu:</label>
              <div className="view-value">{userData.operator.operator_code || '-'}</div>
            </div>

            <div className="view-group">
              <label>Telefon:</label>
              <div className="view-value">{userData.operator.phone || '-'}</div>
            </div>

            <div className="view-group">
              <label>Birim:</label>
              <div className="view-value">
                {userData.operator.Unit ? 
                  `${userData.operator.Unit.unit_name} (${userData.operator.Unit.unit_code})` : 
                  '-'}
              </div>
            </div>

            <div className="view-group">
              <label>İstasyon:</label>
              <div className="view-value">
                {userData.operator.Station ? 
                  `${userData.operator.Station.station_name} (${userData.operator.Station.station_code})` : 
                  '-'}
              </div>
            </div>

            <div className="view-group">
              <label>Yetki Seviyesi:</label>
              <div className="view-value">{userData.operator.authority_level || '-'}</div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <Link 
            to={`/admin/users/${id}/edit`}
            className="btn-edit"
          >
            Düzenle
          </Link>
          <button 
            onClick={handleDeleteUser} 
            className="btn-delete"
            disabled={loading}
          >
            {loading ? 'İşlem Yapılıyor...' : 'Kullanıcıyı Sil'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUserView; 