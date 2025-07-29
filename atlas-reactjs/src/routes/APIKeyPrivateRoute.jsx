import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isTokenValid } from "../middleware/axiosInstance";

const APIKeyPrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const valid = await isTokenValid();
      setIsAuthenticated(valid);
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return null;
  }

  if (isAuthenticated && location.pathname === "/") {
    return <Navigate to="/app/dashboard" />;
  }

  return children;
};

APIKeyPrivateRoute.propTypes = {
  children: PropTypes.node,
};

export default APIKeyPrivateRoute;
