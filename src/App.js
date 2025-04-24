import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Home from './pages/Home';
import Login from './pages/Login';
import { SettingsProvider } from './context/SettingsContext';
import './styles/global.css';

function AppContent() {
  const location = useLocation();
  const hideNavbarRoutes = ['/login'];

  return (
    <div className="app">
      {!hideNavbarRoutes.includes(location.pathname.toLowerCase()) && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/Login" replace />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <SettingsProvider>
      <Router>
        <AppContent />
      </Router>
    </SettingsProvider>
  );
}

export default App;
