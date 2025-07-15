registerLicense(import.meta.env.VITE_SYNCFUSION_LICENSE_KEY);

import React, { Suspense, lazy, useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Settings from "./containers/admin-portal/settings";
import AdminPrivateRoute from "./routes/AdminPrivateRoute";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
import APIKeyPrivateRoute from "./routes/APIKeyPrivateRoute";
import { registerLicense } from "@syncfusion/ej2-base";
import { fetchAppSettings } from "./redux/slices/app-settings";
import { useDispatch } from "react-redux";
const NotFound = lazy(() => import("./components/404-notfound/NotFound"));
const ComingSoon = lazy(() => import("./components/comming-soon/CommingSoon"));
const PremiumModal = lazy(() => import("./components/modals/PremiumModal"));

// Authentication Pages
const Login = lazy(() => import("./containers/common/login/Login"));
const Register = lazy(() => import("./containers/common/register/Register"));
const ForgotPassword = lazy(() =>
  import("./containers/common/forgot-password/ForgotPassword")
);

const ResetPassword = lazy(() => import("./containers/common/reset-password"));

// OAuth Callbacks
const GoogleCallback = lazy(() =>
  import("./containers/callbacks/google-callback")
);
const GithubCallback = lazy(() =>
  import("./containers/callbacks/github-callback")
);

// Subscription Routes
const SubscriptionPlans = lazy(() =>
  import("./containers/common/subscription-plans/SubscriptionPlans")
);

// User Portal Pages
const Dashboard = lazy(() =>
  import("./containers/user-portal/dashboard/Dashboard")
);
const Syncfusion = lazy(() => import("./containers/user-portal/sync-fusion"));
const Backups = lazy(() => import("./containers/user-portal/backups/Backups"));
const InvitedMembers = lazy(() =>
  import("./containers/user-portal/invited-members/InvitedMembers")
);
const UserSettings = lazy(() =>
  import("./containers/user-portal/user-settings")
);
const UpgradePlans = lazy(() =>
  import("./containers/user-portal/upgrade-plans/UpgradePlans")
);
const StructureRenderer = lazy(() =>
  import("./components/renders/StructureRenderer")
);
const UserPrivacyPolicy = lazy(() =>
  import("./containers/user-portal/privacy-policy")
);
const UserTermsOfService = lazy(() =>
  import("./containers/user-portal/terms-of-service")
);

// Admin Portal Pages
const UserTable = lazy(() => import("./containers/admin-portal/users-mgmt"));
const StructureCatalogs = lazy(() =>
  import("./containers/admin-portal/structure-catalogs")
);
const UserProfiles = lazy(() =>
  import("./containers/admin-portal/user-profile")
);
const SubscriptionTable = lazy(() =>
  import("./containers/admin-portal/subscription-mgmt")
);
const AdminDashboard = lazy(() =>
  import("./containers/admin-portal/dashboard")
);
const PrivacyPolicy = lazy(() =>
  import("./containers/admin-portal/admin-privacy-policy")
);
const TermsofService = lazy(() =>
  import("./containers/admin-portal/admin-terms-service")
);
const AdminLogin = lazy(() => import("./containers/admin-portal/admin-login"));

// API Management Pages
const Overview = lazy(() => import("./containers/api-management/overview"));
const FavoriteAPIs = lazy(() =>
  import("./containers/api-management/favorites-apis")
);
const ActivityOverview = lazy(() =>
  import("./containers/api-management/activity-overview")
);
const Explore = lazy(() => import("./containers/api-management/explore"));
const APIs = lazy(() => import("./containers/api-management/apis"));
const TryIt = lazy(() => import("./containers/api-management/try-it"));
const APITemplates = lazy(() =>
  import("./containers/api-management/api-templates")
);
const Examples = lazy(() => import("./containers/api-management/examples"));
const Webhooks = lazy(() => import("./containers/api-management/webhooks"));
const Support = lazy(() => import("./containers/api-management/support"));

const APIKeys = lazy(() => import("./containers/api-management/security-keys"));
const Policies = lazy(() =>
  import("./containers/api-management/security-policies")
);
const Certificates = lazy(() =>
  import("./containers/api-management/security-certificates")
);

// Route Grouping
const authRoutes = [
  { path: "/", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/admin-portal", element: <AdminLogin /> },
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

const userRoutes = [
  { path: "/app/dashboard", element: <Dashboard /> },
  { path: "/app/backups", element: <Backups /> },
  { path: "/app/invitations", element: <InvitedMembers /> },
  { path: "/app/upgrade-plans", element: <UpgradePlans /> },
  { path: "/app/syncfusion", element: <Syncfusion /> },
  { path: "/app/privacy-policy", element: <UserPrivacyPolicy /> },
  { path: "/app/terms-of-service", element: <UserTermsOfService /> },
  { path: "/app/s/:username/:structureId", element: <StructureRenderer /> },
  { path: "/app/coming-soon", element: <ComingSoon /> },
  { path: "/app/user-settings", element: <UserSettings /> },
];

const adminRoutes = [
  { path: "/app/admin-portal/user-management", element: <UserTable /> },
  {
    path: "/app/admin-portal/structure-Catalogs",
    element: <StructureCatalogs />,
  },
  { path: "/app/admin-portal/user-profile", element: <UserProfiles /> },
  {
    path: "/app/admin-portal/subscription-plan",
    element: <SubscriptionTable />,
  },
  { path: "/app/admin-portal/dashboard", element: <AdminDashboard /> },
  { path: "/app/admin-portal/policy", element: <PrivacyPolicy /> },
  { path: "/app/admin-portal/terms-of-service", element: <TermsofService /> },
  { path: "/app/admin-portal/settings", element: <Settings /> },
];

const apiManagementRoutes = [
  { path: "/api-management/overview", element: <Overview /> },
  { path: "/api-management/favorites/apis", element: <FavoriteAPIs /> },
  {
    path: "/api-management/favorites/activity-overview",
    element: <ActivityOverview />,
  },
  { path: "/api-management/explore", element: <Explore /> },
  { path: "/api-management/apis", element: <APIs /> },
  { path: "/api-management/try-it", element: <TryIt /> },
  { path: "/api-management/api-templates", element: <APITemplates /> },
  { path: "/api-management/examples", element: <Examples /> },
  { path: "/api-management/webhooks", element: <Webhooks /> },
  { path: "/api-management/support", element: <Support /> },
  { path: "/api-management/security/keys", element: <APIKeys /> },
  { path: "/api-management/security/policies", element: <Policies /> },
  { path: "/api-management/security/certificates", element: <Certificates /> },
];

const App = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const loadAndSetColorsAndTitle = async () => {
      try {
        const resultAction = await dispatch(fetchAppSettings());
        if (fetchAppSettings.fulfilled.match(resultAction)) {
          const settings = resultAction.payload;

          if (settings?.primaryColor) {
            document.documentElement.style.setProperty(
              "--primary-color",
              settings.primaryColor
            );
          }

          if (settings?.secondaryColor) {
            document.documentElement.style.setProperty(
              "--secondary-color",
              settings.secondaryColor
            );
          }

          const newTitle = settings?.appName || "Atlas";
          localStorage.setItem("appName", newTitle);
          document.title = newTitle;
        }
      } catch (error) {
        console.error("Failed to load theme colors or update title:", error);
      }
    };

    loadAndSetColorsAndTitle();
  }, [dispatch]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setIsModalVisible(params.get("plan") === "upgrade-to-premium");
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

          {userRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={<PrivateRoute>{element}</PrivateRoute>}
            />
          ))}

          {adminRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={<AdminPrivateRoute>{element}</AdminPrivateRoute>}
            />
          ))}

          {apiManagementRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={<APIKeyPrivateRoute>{element}</APIKeyPrivateRoute>}
            />
          ))}
        </Routes>

        {isModalVisible && <PremiumModal closeModal={closeModal} />}
      </Suspense>
    </div>
  );
};

export default App;
