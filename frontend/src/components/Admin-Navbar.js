import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import ThemeToggleButton from './ThemeToggleButton'; 
import '../styles/Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFlightId, setExpandedFlightId] = useState(null);

/*dummy data for search functionality beloww */
  const sampleFlights = [
    { id: 1, code: 'TK101', model: 'Boeing 737', speed: 850, altitude: 9000, country: 'Türkiye', airline: 'Türk Hava Yolları' },
    { id: 2, code: 'LH202', model: 'Airbus A320', speed: 780, altitude: 11000, country: 'Almanya', airline: 'Lufthansa' },
    { id: 3, code: 'BA303', model: 'Concorde', speed: 1200, altitude: 15000, country: 'Birleşik Krallık', airline: 'British Airways' }
  ];
  const [flights] = useState(sampleFlights);

  const filteredFlights = flights.filter(f =>
    f.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  const handleResultClick = (id) => {
    setExpandedFlightId(expandedFlightId === id ? null : id);
  };
  
  return (
    <nav className="navbar">
      <Link to="/Home" className="nav-brand">
        <img src="/favicon-32x32.png" alt="Logo" className="nav-logo" />HvKK
      </Link>

      <div className="nav-links search-section">
        <form onSubmit={(e) => e.preventDefault()} className="search-form">
          <input
            type="text"
            placeholder="Uçak Ara"
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
          <button type="submit" className="search-button">{t('Ara')}</button>
        </form>

        {searchQuery && filteredFlights.length > 0 && (
          <div className="search-results">
            {filteredFlights.map((flight) => (
              <div 
              key={flight.id} 
              className="search-result-item"
              onClick={() => handleResultClick(flight.id)}
              >
                ✈️ <strong>{flight.code}</strong> - {flight.model} | {flight.speed} km/h | {flight.altitude} m
                {expandedFlightId === flight.id && (
                  <div className="expanded-flight-details">
                    <p><strong>Ülke:</strong> {flight.country}</p>
                    <p><strong>Havalimanı:</strong> {flight.airline}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <Link
          to="/admin/profile"
          className={`nav-link ${location.pathname === '/admin/profile' ? 'active' : ''}`}
        >
          Admin Profil
        </Link>
        <Link
          to="/flight-control"
          className={`nav-link ${location.pathname === '/flight-control' ? 'active' : ''}`}
        >
          Uçuş Kontrol
        </Link>
        <Link
          to="/admin"
          className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
        >
          Admin Panel
        </Link>
        {/* Tema Değiştirme Butonu */}
        {localStorage.getItem('token') && (
          <ThemeToggleButton />
        )}
      </div>
    </nav>
  );
};

export default Navbar;
