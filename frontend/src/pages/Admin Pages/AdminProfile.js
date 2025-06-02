import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import '../../styles/AdminProfile.css';
import { toast } from 'react-toastify';

const AdminProfile = () => {
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        role: '',
        lastLogin: '',
        isActive: false,
        createdAt: ''
    });

    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        username: '',
        email: '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await adminService.getProfile();
            
            const profileData = {
                username: data.username || 'Admin',
                email: data.email || 'admin@hvkk.mil.tr',
                role: data.role || 'admin',
                lastLogin: data.lastLogin || data.last_login || 'Hiç giriş yapılmadı',
                isActive: data.isActive || data.is_active || true,
                createdAt: data.createdAt || data.created_at || 'Bilinmiyor'
            };
            
            setProfile(profileData);
            setEditData({
                username: profileData.username,
                email: profileData.email,
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            toast.error('Profil bilgileri alınamadı: ' + (typeof error === 'string' ? error : error.message || 'Bilinmeyen bir hata oluştu.'));
            
            const defaultProfile = {
                username: 'Admin Kullanıcı',
                email: 'admin@hvkk.mil.tr',
                role: 'admin',
                lastLogin: new Date().toLocaleString('tr-TR'),
                isActive: true,
                createdAt: new Date().toLocaleString('tr-TR')
            };
            
            setProfile(defaultProfile);
            setEditData({
                username: defaultProfile.username,
                email: defaultProfile.email,
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);

            // Şifre değişikliği kontrolü
            if (editData.newPassword) {
                if (editData.newPassword !== editData.confirmPassword) {
                    toast.error('Yeni şifreler eşleşmiyor');
                    return;
                }
                if (editData.newPassword.length < 6) {
                    toast.error('Yeni şifre en az 6 karakter olmalıdır');
                    return;
                }
                if (!editData.oldPassword) {
                    toast.error('Mevcut şifrenizi girmelisiniz');
                    return;
                }
            }

            const updateData = {
                username: editData.username,
                email: editData.email
            };

            if (editData.newPassword) {
                updateData.oldPassword = editData.oldPassword;
                updateData.newPassword = editData.newPassword;
            }

            const updatedProfile = await adminService.updateProfile(updateData);
            
            setProfile(prev => ({
                ...prev,
                username: updatedProfile.username || editData.username,
                email: updatedProfile.email || editData.email
            }));
            
            setIsEditing(false);
            setEditData({
                ...editData,
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            toast.success('Profil başarıyla güncellendi');
        } catch (error) {
            toast.error('Profil güncellenirken hata oluştu: ' + error.toString());
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditData({
            username: profile.username || '',
            email: profile.email || '',
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
    };

    if (loading && !profile.username) {
        return (
            <div className="admin-profile-container">
                <div className="loading">Profil bilgileri yükleniyor...</div>
            </div>
        );
    }

    return (
        <div className="admin-profile-container">
            <h2>Admin Profili</h2>
            
            {!isEditing ? (
                // VIEW MODE
                <div className="profile-view">
                    <div className="form-section">
                        <h3>Profil Bilgileri</h3>
                        <div className="form-group">
                            <label>Kullanıcı Adı</label>
                            <div className="profile-field">{profile.username}</div>
                        </div>
                        <div className="form-group">
                            <label>E-posta</label>
                            <div className="profile-field">{profile.email}</div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Hesap Bilgileri</h3>
                        <div className="form-group">
                            <label>Rol</label>
                            <div className="profile-field">Yönetici</div>
                        </div>
                        <div className="form-group">
                            <label>Son Giriş</label>
                            <div className="profile-field">{profile.lastLogin}</div>
                        </div>
                        <div className="form-group">
                            <label>Hesap Oluşturulma Tarihi</label>
                            <div className="profile-field">{profile.createdAt}</div>
                        </div>
                        <div className="form-group">
                            <label>Hesap Durumu</label>
                            <div className="profile-field">{profile.isActive ? 'Aktif' : 'Pasif'}</div>
                        </div>
                    </div>

                    <div className="button-group">
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="edit-button"
                            disabled={loading}
                        >
                            Düzenle
                        </button>
                    </div>
                </div>
            ) : (
                // EDIT MODE
                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-section">
                        <h3>Profil Bilgileri</h3>
                        <div className="form-group">
                            <label>Kullanıcı Adı</label>
                            <input
                                type="text"
                                name="username"
                                value={editData.username}
                                onChange={handleEditChange}
                                required
                                placeholder="Kullanıcı adınızı girin"
                            />
                        </div>
                        <div className="form-group">
                            <label>E-posta</label>
                            <input
                                type="email"
                                name="email"
                                value={editData.email}
                                onChange={handleEditChange}
                                required
                                placeholder="E-posta adresinizi girin"
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Şifre Değiştir (İsteğe Bağlı)</h3>
                        <div className="form-group">
                            <label>Mevcut Şifre</label>
                            <input
                                type="password"
                                name="oldPassword"
                                value={editData.oldPassword}
                                onChange={handleEditChange}
                                placeholder="Şifre değiştirmek için mevcut şifrenizi girin"
                            />
                        </div>
                        <div className="form-group">
                            <label>Yeni Şifre</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={editData.newPassword}
                                onChange={handleEditChange}
                                placeholder="En az 6 karakter"
                            />
                        </div>
                        <div className="form-group">
                            <label>Yeni Şifre (Tekrar)</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={editData.confirmPassword}
                                onChange={handleEditChange}
                                placeholder="Yeni şifreyi tekrar girin"
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Hesap Bilgileri</h3>
                        <div className="form-group">
                            <label>Rol</label>
                            <div className="profile-field readonly">Yönetici</div>
                        </div>
                        <div className="form-group">
                            <label>Son Giriş</label>
                            <div className="profile-field readonly">{profile.lastLogin}</div>
                        </div>
                        <div className="form-group">
                            <label>Hesap Oluşturulma Tarihi</label>
                            <div className="profile-field readonly">{profile.createdAt}</div>
                        </div>
                        <div className="form-group">
                            <label>Hesap Durumu</label>
                            <div className="profile-field readonly">{profile.isActive ? 'Aktif' : 'Pasif'}</div>
                        </div>
                    </div>

                    <div className="button-group">
                        <button
                            type="submit"
                            disabled={loading}
                            className="save-button"
                        >
                            {loading ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="cancel-button"
                            disabled={loading}
                        >
                            İptal
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default AdminProfile; 