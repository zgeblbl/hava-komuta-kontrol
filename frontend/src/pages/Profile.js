import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import '../styles/Profile.css';

function Profile() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState({
    firstName: 'Mehmet',
    lastName: 'Yılmaz',
    rank: 'Üsteğmen',
    operatorId: 'OP-2024-001',
    email: 'mehmet.yilmaz@hvkk.mil.tr',
    phone: '+90 555 123 4567',
    unit: 'Hava Radar Komutanlığı',
    station: 'İzmir Radar İstasyonu',
    clearanceLevel: 'Üst Düzey',
    certifications: [
      'Radar Operasyon Sertifikası',
      'Hava Trafik Kontrolü Lisansı',
      'Elektronik Harp Sistemleri Sertifikası'
    ],
    avatar: 'https://via.placeholder.com/150',
    status: 'active',
    lastLogin: '2024-03-15T08:30:00',
    shiftHours: '08:00 - 16:00'
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // API çağrısı burada yapılacak
      console.log('Profil güncellendi:', profile);
      setIsEditing(false);
    } catch (error) {
      console.error('Profil güncellenirken hata oluştu:', error);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="avatar-upload">
          <img
            src={profile.avatar}
            alt={t('profilePhoto')}
            className="profile-avatar"
          />
          {isEditing && (
            <label className="avatar-upload-label">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setProfile(prev => ({
                        ...prev,
                        avatar: reader.result
                      }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              📷
            </label>
          )}
        </div>
        <div className="profile-info">
          <div className="profile-title">
            <h1 className="profile-name">
              {profile.rank} {profile.firstName} {profile.lastName}
            </h1>
            <span className={`status-badge status-${profile.status}`}>
              {profile.status === 'active' ? t('active') : t('offline')}
            </span>
          </div>
          <p className="profile-email">{profile.email}</p>
          <p className="profile-unit">{profile.unit}</p>
          <p className="profile-station">{profile.station}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="profile-section">
          <h2 className="profile-section-title">{t('operatorInfo')}</h2>
          <div className="profile-form">
            <div className="form-group">
              <label htmlFor="operatorId">{t('operatorId')}</label>
              <input
                type="text"
                id="operatorId"
                name="operatorId"
                value={profile.operatorId}
                disabled
              />
            </div>

            <div className="form-group">
              <label htmlFor="rank">{t('rank')}</label>
              <input
                type="text"
                id="rank"
                name="rank"
                value={profile.rank}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label htmlFor="firstName">{t('firstName')}</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={profile.firstName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">{t('lastName')}</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={profile.lastName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">{t('email')}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">{t('phone')}</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="profile-section-title">{t('dutyInfo')}</h2>
          <div className="profile-form">
            <div className="form-group">
              <label htmlFor="unit">{t('unit')}</label>
              <input
                type="text"
                id="unit"
                name="unit"
                value={profile.unit}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label htmlFor="station">{t('station')}</label>
              <input
                type="text"
                id="station"
                name="station"
                value={profile.station}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label htmlFor="clearanceLevel">{t('clearanceLevel')}</label>
              <input
                type="text"
                id="clearanceLevel"
                name="clearanceLevel"
                value={profile.clearanceLevel}
                disabled
              />
            </div>

            <div className="form-group">
              <label htmlFor="shiftHours">{t('shiftHours')}</label>
              <input
                type="text"
                id="shiftHours"
                name="shiftHours"
                value={profile.shiftHours}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="profile-section-title">{t('certificationsAndPermissions')}</h2>
          <div className="certifications-list">
            {profile.certifications.map((cert, index) => (
              <div key={index} className="certification-item">
                <span className="certification-icon">🎖️</span>
                {cert}
              </div>
            ))}
          </div>
        </div>

        <div className="profile-actions">
          {isEditing ? (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsEditing(false)}
              >
                {t('cancel')}
              </button>
              <button type="submit" className="btn btn-primary">
                {t('save')}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsEditing(true)}
            >
              {t('edit')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default Profile; 