
import React from 'react';

import '../styles/ThemeToggleButton.css'; 

const ToggleStatisticsButton = ({ isOpen, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="toggle-statistics-button theme-toggle-button" 
      aria-expanded={isOpen}
      aria-label={isOpen ? "İstatistikleri Gizle" : "İstatistikleri Göster"}
      title={isOpen ? "İstatistikleri Gizle" : "İstatistikleri Göster"}
    >
      {isOpen ? '📊✖️' : '📊'}
      <span className="button-text">{isOpen ? 'Kapat' : 'İstatistik'}</span>
    </button>
  );
};

export default ToggleStatisticsButton;