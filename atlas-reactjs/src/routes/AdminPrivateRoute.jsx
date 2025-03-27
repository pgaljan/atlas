import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAdminTokenValid } from "../middleware/axiosInstance";

const AdminPrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAdminAuth = async () => {
      const valid = await isAdminTokenValid();
      setIsAuthenticated(valid);
    };

    checkAdminAuth();
  }, []);

  if (isAuthenticated === null) {
    return null;
  }

  if (isAuthenticated) {
    if (location.pathname === "/") {
      return <Navigate to="/app/admin-portal/dashboard" />;
    }
    return children;
  } else {
    return <Navigate to="/admin-portal" />;
  }
};

AdminPrivateRoute.propTypes = {
  children: PropTypes.node,
};

export default AdminPrivateRoute;
