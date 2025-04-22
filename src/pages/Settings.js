import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { useTranslation } from '../hooks/useTranslation';
import '../styles/Settings.css';

const Settings = () => {
  const { settings, updateSettings } = useSettings();
  const { t } = useTranslation();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateSettings({
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleReset = () => {
    // Varsayılan ayarları context'ten alıp uygulayabiliriz
    const defaultSettings = {
      theme: 'dark',
      language: 'tr',
      mapType: 'satellite',
      showFlightPaths: true,
      showAltitude: true,
      showSpeed: true,
      showHeading: true,
      showAircraftInfo: true,
      showWeather: true,
      showAirports: true,
      showRadar: true,
      showRestrictedAreas: true,
      emergencyAlerts: true,
      boundaryAlerts: true,
      weatherAlerts: true,
      updateFrequency: '5',
      dataQuality: 'high'
    };
    updateSettings(defaultSettings);
  };

  return (
    <div className="settings-container">
      <h1>{t('systemSettings')}</h1>
      
      <form onSubmit={(e) => e.preventDefault()}>
        {/* Görünüm Ayarları */}
        <div className="settings-section">
          <h2 className="settings-section-title">{t('appearanceSettings')}</h2>
          <div className="settings-form">
            <div className="form-group">
              <label htmlFor="theme">{t('theme')}</label>
              <select
                id="theme"
                name="theme"
                value={settings.theme}
                onChange={handleChange}
              >
                <option value="dark">{t('darkTheme')}</option>
                <option value="light">{t('lightTheme')}</option>
                <option value="military">{t('militaryTheme')}</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="mapType">{t('mapType')}</label>
              <select
                id="mapType"
                name="mapType"
                value={settings.mapType}
                onChange={handleChange}
              >
                <option value="satellite">{t('satelliteView')}</option>
                <option value="terrain">{t('terrainView')}</option>
                <option value="military">{t('militaryMap')}</option>
                <option value="hybrid">{t('hybridView')}</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="language">{t('language')}</label>
              <select
                id="language"
                name="language"
                value={settings.language}
                onChange={handleChange}
              >
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        {/* Uçuş Görüntüleme Ayarları */}
        <div className="settings-section">
          <h2 className="settings-section-title">{t('flightDisplay')}</h2>
          <div className="settings-form">
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="showFlightPaths"
                  checked={settings.showFlightPaths}
                  onChange={handleChange}
                />
                {t('showFlightPaths')}
              </label>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="showAltitude"
                  checked={settings.showAltitude}
                  onChange={handleChange}
                />
                {t('showAltitude')}
              </label>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="showSpeed"
                  checked={settings.showSpeed}
                  onChange={handleChange}
                />
                {t('showSpeed')}
              </label>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="showHeading"
                  checked={settings.showHeading}
                  onChange={handleChange}
                />
                {t('showHeading')}
              </label>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="showAircraftInfo"
                  checked={settings.showAircraftInfo}
                  onChange={handleChange}
                />
                {t('showAircraftInfo')}
              </label>
            </div>
          </div>
        </div>

        {/* Harita Ayarları */}
        <div className="settings-section">
          <h2 className="settings-section-title">{t('mapLayers')}</h2>
          <div className="settings-form">
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="showWeather"
                  checked={settings.showWeather}
                  onChange={handleChange}
                />
                {t('weatherLayer')}
              </label>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="showAirports"
                  checked={settings.showAirports}
                  onChange={handleChange}
                />
                {t('showAirports')}
              </label>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="showRadar"
                  checked={settings.showRadar}
                  onChange={handleChange}
                />
                {t('showRadar')}
              </label>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="showRestrictedAreas"
                  checked={settings.showRestrictedAreas}
                  onChange={handleChange}
                />
                {t('showRestrictedAreas')}
              </label>
            </div>
          </div>
        </div>

        {/* Bildirim Ayarları */}
        <div className="settings-section">
          <h2 className="settings-section-title">{t('notificationSettings')}</h2>
          <div className="settings-form">
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="emergencyAlerts"
                  checked={settings.emergencyAlerts}
                  onChange={handleChange}
                />
                {t('emergencyAlerts')}
              </label>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="boundaryAlerts"
                  checked={settings.boundaryAlerts}
                  onChange={handleChange}
                />
                {t('boundaryAlerts')}
              </label>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="weatherAlerts"
                  checked={settings.weatherAlerts}
                  onChange={handleChange}
                />
                {t('weatherAlerts')}
              </label>
            </div>
          </div>
        </div>

        {/* Performans Ayarları */}
        <div className="settings-section">
          <h2 className="settings-section-title">{t('performanceSettings')}</h2>
          <div className="settings-form">
            <div className="form-group">
              <label htmlFor="updateFrequency">{t('updateFrequency')} ({t('second')})</label>
              <select
                id="updateFrequency"
                name="updateFrequency"
                value={settings.updateFrequency}
                onChange={handleChange}
              >
                <option value="1">1 {t('second')}</option>
                <option value="5">5 {t('second')}</option>
                <option value="10">10 {t('second')}</option>
                <option value="30">30 {t('second')}</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dataQuality">{t('dataQuality')}</label>
              <select
                id="dataQuality"
                name="dataQuality"
                value={settings.dataQuality}
                onChange={handleChange}
              >
                <option value="low">{t('lowQuality')}</option>
                <option value="medium">{t('mediumQuality')}</option>
                <option value="high">{t('highQuality')}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="settings-actions">
          <button type="button" className="btn btn-secondary" onClick={handleReset}>
            {t('resetToDefault')}
          </button>
          <button type="submit" className="btn btn-primary">
            {t('save')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings; 