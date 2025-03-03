import React, { Suspense, lazy, useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import PremiumModal from "./components/modals/PremiumModal";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";

const NotFound = lazy(() => import("./components/404-notfound/NotFound"));
const GoogleCallback = lazy(() =>
  import("./containers/callbacks/google-callback")
);
const GithubCallback = lazy(() =>
  import("./containers/callbacks/github-callback")
);
const Support = lazy(() => import("./containers/user/support/Support"));
const MarkmapCanvas = lazy(() =>
  import("./components/markmap/markmap-canvas/MarkmapCanvas")
);
const Profile = lazy(() => import("./containers/user/profile/Profile"));
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
const UploadedFiles = lazy(() =>
  import("./containers/user/uploaded-files/UploadedFiles")
);
const UpgradePlans = lazy(() =>
  import("./containers/user/upgrade-plans/UpgradePlans")
);
const TeamMembers = lazy(() =>
  import("./containers/user/team-members/TeamMembers")
);
const DeletedMindmaps = lazy(() =>
  import("./containers/user/deleted-markmaps/DeletedMarkmaps")
);

const publicRoutes = [
  { path: "/", element: <Login /> },
  { path: "/app/google-callback", element: <GoogleCallback /> },
  { path: "/app/github-callback", element: <GithubCallback /> },
  { path: "/register", element: <Register /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/subscription-plans", element: <SubscriptionPlans /> },
  { path: "*", element: <NotFound /> },
];

const privateRoutes = [
  { path: "/app/dashboard", element: <Dashboard /> },
  { path: "/app/s/:username/:structureId", element: <MarkmapCanvas /> },
  // { path: "/app/team-members", element: <TeamMembers /> },
  // { path: "/app/support", element: <Support /> },
  // { path: "/app/me", element: <Profile /> },
  { path: "/app/backups", element: <Backups /> },
  // { path: "/app/uploaded-files", element: <UploadedFiles /> },
  // { path: "/app/deleted-markmaps", element: <DeletedMindmaps /> },
  { path: "/app/upgrade-plans", element: <UpgradePlans /> },
];

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
