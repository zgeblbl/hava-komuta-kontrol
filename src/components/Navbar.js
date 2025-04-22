import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import '../styles/Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <img src="/logo.png" alt="Logo" className="nav-logo" />
        HvKK
      </Link>
      
      <div className="nav-links">
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