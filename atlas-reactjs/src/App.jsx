import React, { Suspense, lazy, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Carousel from "./components/carousels/TourCarousel";
import { fetchCatalogsByUserTier } from "./redux/slices/structure-catalogues";
import AdminPrivateRoute from "./routes/AdminPrivateRoute";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
import { fetchSubscription } from "./redux/slices/subscriptions";

const NotFound = lazy(() => import("./components/404-notfound/NotFound"));
const ComingSoon = lazy(() => import("./components/comming-soon/CommingSoon"));
const PremiumModal = lazy(() => import("./components/modals/PremiumModal"));

// Authentication Pages
const Login = lazy(() => import("./containers/common/login/Login"));
const Register = lazy(() => import("./containers/common/register/Register"));
const ResetPassword = lazy(() =>
  import("./containers/common/reset-password/ResetPassword")
);

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
const Backups = lazy(() => import("./containers/user-portal/backups/Backups"));
const InvitedMembers = lazy(() =>
  import("./containers/user-portal/invited-members/InvitedMembers")
);
const UpgradePlans = lazy(() =>
  import("./containers/user-portal/upgrade-plans/UpgradePlans")
);
const MarkmapCanvas = lazy(() =>
  import("./components/markmap/markmap-canvas/MarkmapCanvas")
);

// Admin Portal Pages
const UserTable = lazy(() =>
  import("./containers/admin-portal/users-management")
);
const StructureCatalogues = lazy(() =>
  import("./containers/admin-portal/structure-catalogues")
);
const UserProfiles = lazy(() =>
  import("./containers/admin-portal/user-profile")
);
const SubscriptionTable = lazy(() =>
  import("./containers/admin-portal/subscription-management")
);
const AdminDashboard = lazy(() =>
  import("./containers/admin-portal/dashboard")
);
const AdminLogin = lazy(() => import("./containers/admin-portal/admin-login"));

// Route Grouping
const authRoutes = [
  { path: "/", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/reset-password", element: <ResetPassword /> },
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
  { path: "/app/invited-members", element: <InvitedMembers /> },
  { path: "/app/upgrade-plans", element: <UpgradePlans /> },
  { path: "/app/s/:username/:structureId", element: <MarkmapCanvas /> },
  { path: "/app/coming-soon", element: <ComingSoon /> },
];

const adminRoutes = [
  { path: "/app/admin-portal/user-management", element: <UserTable /> },
  {
    path: "/app/admin-portal/structure-catalogues",
    element: <StructureCatalogues />,
  },
  { path: "/app/admin-portal/user-profile", element: <UserProfiles /> },
  {
    path: "/app/admin-portal/subscription-plan",
    element: <SubscriptionTable />,
  },
  { path: "/app/admin-portal/dashboard", element: <AdminDashboard /> },
];

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userId = Cookies.get("atlas_userId");
  const [catalogs, setCatalogs] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    if (userId) {
      dispatch(fetchSubscription(userId)).then((res) => {
        setCurrentPlan(res.payload?.plan?.name);
      });
    }
  }, [dispatch, userId]);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentPlan) return;

      const resultAction = await dispatch(fetchCatalogsByUserTier(currentPlan));

      if (fetchCatalogsByUserTier.fulfilled.match(resultAction)) {
        setCatalogs(resultAction.payload);
      }
    };

    fetchData();
  }, [dispatch, currentPlan]);

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

  const handleBannerClose = () => {
    setShowBanner(false);
  };

  const isUserRoute = userRoutes.some((route) =>
    location.pathname.startsWith(route.path)
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {userId && isUserRoute && showBanner && (
        <Carousel data={catalogs} duration={5000} onClose={handleBannerClose} />
      )}

      <Suspense
        fallback={
          <div className="absolute inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-custom-main border-t-transparent"></div>
          </div>
        }
      >
        <Routes>
          {/* Public Routes */}
          {publicRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={<PublicRoute>{element}</PublicRoute>}
            />
          ))}

          {/* User Private Routes */}
          {userRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={<PrivateRoute>{element}</PrivateRoute>}
            />
          ))}

          {/* Admin Routes */}
          {adminRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={<AdminPrivateRoute>{element}</AdminPrivateRoute>}
            />
          ))}
        </Routes>

        {isModalVisible && <PremiumModal closeModal={closeModal} />}
      </Suspense>
    </div>
  );
};

export default App;
