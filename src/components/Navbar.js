import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import '../styles/Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

/*dummy data for search functionality beloww */
  const sampleFlights = [
    { id: 1, code: 'TK101', model: 'Boeing 737', speed: 850, altitude: 9000, country: 'Turkey', airline: 'Turkish Airlines' },
    { id: 2, code: 'LH202', model: 'Airbus A320', speed: 780, altitude: 11000, country: 'Germany', airline: 'Lufthansa' },
    { id: 3, code: 'BA303', model: 'Concorde', speed: 1200, altitude: 15000, country: 'UK', airline: 'British Airways' },
  ];
  const [flights] = useState(sampleFlights);

  const filteredFlights = flights.filter(f =>
    f.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <img src="/logo.png" alt="Logo" className="nav-logo" />
        HvKK
      </Link>

      <div className="nav-links search-section">
        <form onSubmit={(e) => e.preventDefault()} className="search-form">
          <input
            type="text"
            placeholder="Search flights"
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
          <button type="submit" className="search-button">{t('Search')}</button>
        </form>

        {searchQuery && filteredFlights.length > 0 && (
          <div className="search-results">
            {filteredFlights.map((flight) => (
              <div key={flight.id} className="search-result-item">
                ✈️ <strong>{flight.code}</strong> - {flight.model} | {flight.speed} km/h | {flight.altitude} m
              </div>
            ))}
          </div>
        )}

        <Link
          to="/profile"
          className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
        >
          {t('profile')}
        </Link>
        <Link
          to="/settings"
          className={`nav-link ${location.pathname === '/settings' ? 'active' : ''}`}
        >
          {t('settings')}
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
