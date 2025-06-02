// pages/Admin Pages/AdminUsers.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../../services/api';
import '../../styles/AdminPanel.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await userService.getUsers(currentPage, pageSize);
      
      setUsers(response.users || []);
      setTotalPages(response.meta?.total_page || 1);
      setTotalUsers(response.meta?.total || 0);
    } catch (err) {
      setError(err || 'Kullanıcılar yüklenirken bir hata oluştu');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    const confirmMessage = `"${username}" kullanıcısını silmek istediğinizden emin misiniz?

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
      await userService.deleteUser(userId);
      
      // Success message
      alert(`${username} kullanıcısı ve tüm bağlantılı verileri başarıyla silindi.`);
      
      // Refresh the users list
      await fetchUsers();
    } catch (err) {
      console.error('Delete user error:', err);
      setError(`Kullanıcı silinirken bir hata oluştu: ${err}`);
      alert(`Kullanıcı silinirken bir hata oluştu: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // Filtreleme fonksiyonu (client-side)
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.operator?.first_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.operator?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'ACTIVE' && user.is_active) ||
      (filterStatus === 'INACTIVE' && !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusClass = (isActive) => {
    return isActive ? 'status-completed' : 'status-aborted';
  };

  const getStatusText = (isActive) => {
    return isActive ? 'Aktif' : 'Pasif';
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === '0001-01-01T00:00:00Z') return 'Hiç giriş yapılmamış';
    return new Date(dateString).toLocaleString('tr-TR');
  };

  const renderUserName = (user) => {
    if (user.operator && user.operator.first_name && user.operator.last_name) {
      return `${user.operator.first_name} ${user.operator.last_name}`;
    }
    return user.username;
  };

  const renderOperatorCode = (user) => {
    if (user.operator && user.operator.operator_code) {
      return user.operator.operator_code;
    }
    return '-';
  };

  const renderUnit = (user) => {
    if (user.operator && user.operator.Unit) {
      return `${user.operator.Unit.unit_name} (${user.operator.Unit.unit_code})`;
    }
    return '-';
  };

  const renderStation = (user) => {
    if (user.operator && user.operator.Station) {
      return `${user.operator.Station.station_name} (${user.operator.Station.station_code})`;
    }
    return '-';
  };

  const renderAuthorityLevel = (user) => {
    if (user.operator && user.operator.authority_level) {
      return user.operator.authority_level;
    }
    return '-';
  };

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h3>Kullanıcılar</h3>
        <Link to="/admin/users/create" className="admin-btn">
          Yeni Kullanıcı Ekle
        </Link>
      </div>

      {error && (
        <div className="error-message">
          <strong>Hata:</strong> {error}
        </div>
      )}

      {/* Stats */}
      <div className="admin-stats">
        <span>Toplam Kullanıcı: {totalUsers}</span>
        <span>Sayfa: {currentPage} / {totalPages}</span>
        <span>Görüntülenen: {filteredUsers.length}</span>
        {filterRole !== 'all' && <span>Rol: {filterRole}</span>}
        {filterStatus !== 'all' && <span>Durum: {filterStatus}</span>}
        {searchTerm && <span>Arama: "{searchTerm}"</span>}
      </div>

      {/* Search and Filters */}
      <div className="admin-filters">
        <input
          type="text"
          placeholder="Kullanıcı adı, e-posta, ad veya soyad ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-search"
        />

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="admin-filter"
        >
          <option value="all">Tüm Roller</option>
          <option value="ADMIN">Admin</option>
          <option value="OPERATOR">Operatör</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="admin-filter"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="ACTIVE">Aktif</option>
          <option value="INACTIVE">Pasif</option>
        </select>

        <button
          onClick={() => {
            setSearchTerm('');
            setFilterRole('all');
            setFilterStatus('all');
            setCurrentPage(1);
          }}
          className="admin-btn-secondary"
        >
          Temizle
        </button>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="loading">Kullanıcılar yükleniyor...</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Kullanıcı Adı</th>
                <th>E-posta</th>
                <th>Ad Soyad</th>
                <th>Rol</th>
                <th>Durum</th>
                <th>Operatör Kodu</th>
                <th>Birim</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">
                    {searchTerm || filterRole !== 'all' || filterStatus !== 'all' ? 
                      'Arama kriterlerine uygun kullanıcı bulunamadı' : 
                      'Henüz kullanıcı eklenmemiş'
                    }
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <span className="flight-number">{user.username}</span>
                    </td>
                    <td>{user.email}</td>
                    <td>{renderUserName(user)}</td>
                    <td>
                      <span className={`status-badge ${user.role === 'ADMIN' ? 'status-in-progress' : 'status-pending'}`}>
                        {user.role === 'ADMIN' ? 'Admin' : 'Operatör'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(user.is_active)}`}>
                        {getStatusText(user.is_active)}
                      </span>
                    </td>
                    <td>{renderOperatorCode(user)}</td>
                    <td>{renderUnit(user)}</td>
                    <td>
                      <div className="flight-actions">
                        <Link 
                          to={`/admin/users/${user.id}`}
                          className="admin-btn-small admin-btn-complete"
                        >
                          Görüntüle
                        </Link>
                        <Link 
                          to={`/admin/users/${user.id}/edit`}
                          className="admin-btn-small admin-btn-start"
                        >
                          Düzenle
                        </Link>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          className="admin-btn-small admin-btn-delete"
                        >
                          Sil
                        </button>
                      </div>
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

export default AdminUsers;
