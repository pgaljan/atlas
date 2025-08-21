# Private Routes

Private routes require a valid login session.

## Setup
- Defined inside `src/routes/AuthenticatedRoutes.jsx`.
- Wrapped with a `PrivateRoute` or similar component.
- Uses `redux` or `js-cookie` for token/session validation.

## Example
```jsx
import { Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = Boolean(localStorage.getItem("token"));
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export const AuthenticatedRoutes = [
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
  },
];
