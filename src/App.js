import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';  // Regular Navbar
import AdminNavbar from './components/Admin-Navbar';  // Admin Navbar
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import AdminPanel from './pages/Admin Pages/AdminPanel';
import AdminUsers from './pages/Admin Pages/AdminUsers';
import AdminAircraft from './pages/Admin Pages/AdminAircraft';
import Home from './pages/Home';
import Login from './pages/Login';
import { SettingsProvider } from './context/SettingsContext';
import './styles/global.css';
import FlightControlPage from './pages/FlightControlPage';
import 'leaflet/dist/leaflet.css';
import AdminUserEdit from './pages/Admin Pages/AdminUserEdit';
import AdminAircraftEdit from './pages/Admin Pages/AdminAircraftEdit';

function AppContent() {
  const location = useLocation();
  const hideNavbarRoutes = ['/home', '/login'];

  // Retrieve user ID from localStorage
  const userId = localStorage.getItem('userId');

  // Determine which navbar to display based on user ID (0 = admin)
  const isAdmin = userId === '0';  // Check if the user is an admin

  return (
    <div className="app">
      {/* Render AdminNavbar if user is an admin, otherwise render regular Navbar */}
      {!hideNavbarRoutes.includes(location.pathname.toLowerCase()) && (isAdmin ? <AdminNavbar /> : <Navbar />)}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/admin" element={<AdminPanel />}>
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/edit/:id" element={<AdminUserEdit />} />
            <Route path="aircraft" element={<AdminAircraft />} />
            <Route path="/admin/aircraft/edit/:id" element={<AdminAircraftEdit />} />
          </Route>
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/flight-control" element={<FlightControlPage />} />
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
