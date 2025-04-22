import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import { SettingsProvider } from './context/SettingsContext';
import './styles/global.css';

function App() {
  return (
    <SettingsProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/profile" replace />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </Router>
    </SettingsProvider>
  );
}

export default App;
