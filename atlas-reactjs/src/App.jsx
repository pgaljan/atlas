import React, { Suspense, lazy, useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
import UserTable from "./containers/admin-portal/users-management";
import UserProfiles from "./containers/admin-portal/user-profile";
import SubscriptionTable from "./containers/admin-portal/subscription-management";
import AdminDashboard from "./containers/admin-portal/dashboard";
import AdminLogin from "./containers/admin-portal/login";
import AdministratorsTable from "./containers/admin-portal/administrator-management";

// Error and Fallback Pages
const NotFound = lazy(() => import("./components/404-notfound/NotFound"));

// OAuth Callback Handlers
const GoogleCallback = lazy(() =>
  import("./containers/callbacks/google-callback")
);
const GithubCallback = lazy(() =>
  import("./containers/callbacks/github-callback")
);

// Common Authentication Pages
const Login = lazy(() => import("./containers/common/login/Login"));
const Register = lazy(() => import("./containers/common/register/Register"));
const ResetPassword = lazy(() =>
  import("./containers/common/reset-password/ResetPassword")
);

// Subscription and Plan Management
const SubscriptionPlans = lazy(() =>
  import("./containers/common/subscription-plans/SubscriptionPlans")
);
const UpgradePlans = lazy(() =>
  import("./containers/user-portal/upgrade-plans/UpgradePlans")
);

// User Portal Pages
const Dashboard = lazy(() =>
  import("./containers/user-portal/dashboard/Dashboard")
);
const Backups = lazy(() => import("./containers/user-portal/backups/Backups"));
const Profile = lazy(() => import("./containers/user-portal/profile/Profile"));
const Support = lazy(() => import("./containers/user-portal/support/Support"));
const UploadedFiles = lazy(() =>
  import("./containers/user-portal/uploaded-files/UploadedFiles")
);
const TeamMembers = lazy(() =>
  import("./containers/user-portal/team-members/TeamMembers")
);
const DeletedMindmaps = lazy(() =>
  import("./containers/user-portal/deleted-markmaps/DeletedMarkmaps")
);

// Additional Components
const PremiumModal = lazy(() => import("./components/modals/PremiumModal"));
const ComingSoon = lazy(() => import("./components/comming-soon/CommingSoon"));
const MarkmapCanvas = lazy(() =>
  import("./components/markmap/markmap-canvas/MarkmapCanvas")
);

// Organize public routes by type
const authRoutes = [
  { path: "/", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/reset-password", element: <ResetPassword /> },
];

const callbackRoutes = [
  { path: "/app/google-callback", element: <GoogleCallback /> },
  { path: "/app/github-callback", element: <GithubCallback /> },
];

const subscriptionRoutes = [
  { path: "/subscription-plans", element: <SubscriptionPlans /> },
];

const publicRoutes = [
  ...authRoutes,
  ...callbackRoutes,
  ...subscriptionRoutes,
  { path: "*", element: <NotFound /> },
];

// Group private (user) routes
const userRoutes = [
  { path: "/app/dashboard", element: <Dashboard /> },
  { path: "/app/s/:username/:structureId", element: <MarkmapCanvas /> },
  { path: "/app/coming-soon", element: <ComingSoon /> },
  { path: "/app/backups", element: <Backups /> },
  { path: "/app/upgrade-plans", element: <UpgradePlans /> },
  { path: "/app/admin/user-management", element: <UserTable /> },
  {
    path: "/app/admin/administrator-management",
    element: <AdministratorsTable />,
  },
  { path: "/app/admin/user-profile", element: <UserProfiles /> },
  { path: "/app/admin/subscription-plan", element: <SubscriptionTable /> },
  { path: "/app/admin", element: <AdminLogin /> },
  { path: "/app/admin/dashboard", element: <AdminDashboard /> },
  // { path: "/app/team-members", element: <TeamMembers /> },
  // { path: "/app/support", element: <Support /> },
  // { path: "/app/me", element: <Profile /> },
  // { path: "/app/uploaded-files", element: <UploadedFiles /> },
  // { path: "/app/deleted-markmaps", element: <DeletedMindmaps /> },
];

const privateRoutes = userRoutes;

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    setIsModalVisible(
      new URLSearchParams(location.search).get("plan") === "upgrade-to-premium"
    );
  }, [location.search]);

  const closeModal = () => {
    setIsModalVisible(false);
    const params = new URLSearchParams(location.search);
    params.delete("plan");
    navigate({ search: params.toString() }, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Suspense
        fallback={
          <div className="absolute inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-custom-main border-t-transparent"></div>
          </div>
        }
      >
        <Routes>
          {publicRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={<PublicRoute>{element}</PublicRoute>}
            />
          ))}
          {privateRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={<PrivateRoute>{element}</PrivateRoute>}
            />
          ))}
        </Routes>
        {isModalVisible && <PremiumModal closeModal={closeModal} />}
      </Suspense>
    </div>
  );
};

export default App;
