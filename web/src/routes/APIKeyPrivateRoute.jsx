import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isTokenValid } from '../middleware/axiosInstance';

const APIKeyPrivateRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const valid = await isTokenValid();
        setIsAuthenticated(valid);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    // Show a loader while checking token
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect if token invalid
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (location.pathname === '/') {
    return <Navigate to="/app/dashboard" replace />;
  }

  // Render nested routes
  return <Outlet />;
};

export default APIKeyPrivateRoute;
