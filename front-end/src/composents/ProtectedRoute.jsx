import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAdmin } = useAuth();

    if (!isAdmin) {
        // Rediriger vers la page de login si non authentifié
        return <Navigate to="/admin/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
