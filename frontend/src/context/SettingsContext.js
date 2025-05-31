import React, { createContext, useState, useContext, useEffect } from 'react';

const SettingsContext = createContext();

// Varsayılan ayarlar
const defaultSettings = {
  // Görünüm Ayarları
  theme: 'dark',
  language: 'tr',
  mapType: 'satellite',
  
  // Uçuş Görüntüleme Ayarları
  showFlightPaths: true,
  showAltitude: true,
  showSpeed: true,
  showHeading: true,
  showAircraftInfo: true,
  
  // Harita Ayarları
  showWeather: true,
  showAirports: true,
  showRadar: true,
  showRestrictedAreas: true,
  
  // Bildirim Ayarları
  emergencyAlerts: true,
  boundaryAlerts: true,
  weatherAlerts: true,
  
  // Performans Ayarları
  updateFrequency: '5',
  dataQuality: 'high'
};

export const SettingsProvider = ({ children }) => {
  // Local storage'dan ayarları al veya varsayılan ayarları kullan
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('settings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  // Ayarlar değiştiğinde local storage'a kaydet
  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
    
    // Tema değişikliğini uygula
    document.documentElement.setAttribute('data-theme', settings.theme);
    
  }, [settings]);

  // Ayarları güncelle
  const updateSettings = (newSettings) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 