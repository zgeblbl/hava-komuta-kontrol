import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';  // Regular Navbar
import AdminNavbar from './components/Admin-Navbar';  // Admin Navbar
import Profile from './pages/Profile';
import AdminPanel from './pages/Admin Pages/AdminPanel';
import AdminUsers from './pages/Admin Pages/AdminUsers';
import AdminUserCreate from './pages/Admin Pages/AdminUserCreate';
import AdminUserEdit from './pages/Admin Pages/AdminUserEdit';
import AdminUserView from './pages/Admin Pages/AdminUserView';
import AdminAircraft from './pages/Admin Pages/AdminAircraft';
import AdminAircraftCreate from './pages/Admin Pages/AdminAircraftCreate';
import AdminProfile from './pages/Admin Pages/AdminProfile';
import AdminFlights from './pages/Admin Pages/AdminFlights';
import AdminFlightCreate from './pages/Admin Pages/AdminFlightCreate';
import Home from './pages/Home';
import Login from './pages/Login';
import { SettingsProvider } from './context/SettingsContext';
import './styles/global.css';
import FlightControlPage from './pages/FlightControlPage';
import 'leaflet/dist/leaflet.css';
import AdminAircraftEdit from './pages/Admin Pages/AdminAircraftEdit';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const location = useLocation();
  const hideNavbarRoutes = ['/home', '/login'];

  // Kullanıcı rolünü kontrol et
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'admin';

  return (
    <div className="app">
      {/* Render AdminNavbar if user is an admin, otherwise render regular Navbar */}
      {!hideNavbarRoutes.includes(location.pathname.toLowerCase()) && (isAdmin ? <AdminNavbar /> : <Navbar />)}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          
          {/* Admin Profile Route - Separate from AdminPanel */}
          <Route path="/admin/profile" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminProfile />
            </ProtectedRoute>
          } />
          
          {/* Admin Panel Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          }>
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/create" element={<AdminUserCreate />} />
            <Route path="users/:id" element={<AdminUserView />} />
            <Route path="users/:id/edit" element={<AdminUserEdit />} />
            <Route path="aircraft" element={<AdminAircraft />} />
            <Route path="aircraft/create" element={<AdminAircraftCreate />} />
            <Route path="aircraft/edit/:id" element={<AdminAircraftEdit />} />
            <Route path="flights" element={<AdminFlights />} />
            <Route path="flights/create" element={<AdminFlightCreate />} />
          </Route>

          {/* Protected Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/flight-control" element={
            <ProtectedRoute>
              <FlightControlPage />
            </ProtectedRoute>
          } />
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
