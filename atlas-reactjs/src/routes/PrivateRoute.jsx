import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { isTokenValid } from "../middleware/axiosInstance";

const PrivateRoute = ({ children }) => {
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

  if (isAuthenticated) {
    if (location.pathname === "/") {
      return <Navigate to="/home" />;
    }
    return children;
  } else {
    return <Navigate to="/" />;
  }
};

PrivateRoute.propTypes = {
  children: PropTypes.node,
};

export default PrivateRoute;