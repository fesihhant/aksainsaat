import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children, requireAdmin }) => {
    const { user, isAdmin } = useAuth();

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (requireAdmin && !isAdmin()) {
        return <Navigate to="/" />;
    }

    return children;
};

export default PrivateRoute;
