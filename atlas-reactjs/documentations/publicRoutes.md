## Setup
- Defined in `src/routes/PublicRoutes.jsx`.
- Includes login, signup, landing page, etc.

## Example
```jsx
import Login from "../pages/Login";
import Home from "../pages/Home";

export const PublicRoutes = [
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
];
