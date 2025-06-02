import React from 'react';
import { useSettings } from '../context/SettingsContext';

import '../styles/ThemeToggleButton.css'; 

const ThemeToggleButton = () => {
  const { settings, updateSettings } = useSettings();
  const currentTheme = settings.theme || 'military'; // Veya varsayılan temanız

  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';


    if (updateSettings) {
      updateSettings({ theme: newTheme });
    } else {
      console.error("updateSettings fonksiyonu SettingsContext'te bulunamadı!");

    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-button"
      aria-label={`Geçerli tema: ${currentTheme}. Temayı değiştir.`}
      title={currentTheme === 'light' ? 'Koyu Tema' : 'Açık Tema'}
    >
      {/* Basit emoji ikonları */}
      {currentTheme === 'light' ? '🌙' : '☀️'}
      {/* Veya react-icons ile: */}
      {/* {currentTheme === 'light' ? <FaMoon /> : <FaSun />} */}
      <span className="button-text">{currentTheme === 'light' ? 'Dark' : 'Light'}</span>
    </button>
  );
};

export default ThemeToggleButton;