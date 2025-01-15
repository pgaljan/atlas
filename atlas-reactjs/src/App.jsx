import React, { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";

const NotFound = lazy(() => import("./components/404-notfound/NotFound"));
const MarkmapCanvas = lazy(() =>
  import("./components/markmap/markmap-canvas/MarkmapCanvas")
);
const Login = lazy(() => import("./containers/common/login/Login"));
const Register = lazy(() => import("./containers/common/register/Register"));
const ResetPassword = lazy(() =>
  import("./containers/common/reset-password/ResetPassword")
);
const SubscriptionPlans = lazy(() =>
  import("./containers/common/subscription-plans/SubscriptionPlans")
);
const Backups = lazy(() => import("./containers/user/backups/Backups"));
const Dashboard = lazy(() => import("./containers/user/dashboard/Dashboard"));
const Media = lazy(() => import("./containers/user/media/Media"));
const UpgradePlans = lazy(() =>
  import("./containers/user/upgrade-plans/UpgradePlans")
);
const TeamMembers = lazy(() =>
  import("./containers/user/team-members/TeamMembers")
);
const Trash = lazy(() => import("./containers/user/trash/Trash"));

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/app/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/subscription-plans"
            element={
              <PublicRoute>
                <SubscriptionPlans />
              </PublicRoute>
            }
          />
          <Route
            path="/app/s/:username/:structureId"
            element={
              <PrivateRoute>
                <MarkmapCanvas />
              </PrivateRoute>
            }
          />
          {/* <Route
            path="/app/team-members"
            element={
              <PrivateRoute>
                <TeamMembers />
              </PrivateRoute>
            }
          />
          <Route
            path="/app/backups"
            element={
              <PrivateRoute>
                <Backups />
              </PrivateRoute>
            }
          />
          <Route
            path="/app/media"
            element={
              <PrivateRoute>
                <Media />
              </PrivateRoute>
            }
          />
          <Route
            path="/app/trash"
            element={
              <PrivateRoute>
                <Trash />
              </PrivateRoute>
            }
          /> */}

          {/* <Route
            path="/app/upgrade-plans"
            element={
              <PrivateRoute>
                <UpgradePlans />
              </PrivateRoute>
            }
          /> */}

          <Route
            path="*"
            element={
              <PublicRoute>
                <NotFound />
              </PublicRoute>
            }
          />
        </Routes>
      </Suspense>
    </div>
  );
};

export default App;
