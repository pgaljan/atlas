import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isTokenValid } from '../middleware/axiosInstance';

const CleansheetPrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    const checkAuth = async () => {
      try {
        const valid = await isTokenValid();
        if (mounted) setIsAuthenticated(Boolean(valid));
      } catch (err) {
        if (mounted) setIsAuthenticated(false);
      }
    };

    checkAuth();
    return () => {
      mounted = false;
    };
  }, []);

  if (isAuthenticated === null) {
    return null;
  }

  if (isAuthenticated) {
    if (location.pathname === '/') {
      return <Navigate to="/cleansheet" />;
    }
    return children;
  } else {
    return <Navigate to="/" />;
  }
};

CleansheetPrivateRoute.propTypes = {
  children: PropTypes.node,
};

export default CleansheetPrivateRoute;
