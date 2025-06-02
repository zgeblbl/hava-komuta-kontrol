import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const location = useLocation();
    const userRole = localStorage.getItem('userRole');
    const token = localStorage.getItem('token');

    if (!token) {
        // Not logged in, redirect to login page with the return url
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        // Role not authorized, redirect to home page
        return <Navigate to="/home" replace />;
    }

    return children;
};

export default ProtectedRoute; 