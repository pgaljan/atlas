import React, { Suspense, lazy, useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import Cookies from "js-cookie"
import { Route, Routes, useLocation, useNavigate } from "react-router-dom"
import AdminPrivateRoute from "./routes/AdminPrivateRoute"
import PrivateRoute from "./routes/PrivateRoute"
import PublicRoute from "./routes/PublicRoute"
import { fetchSubscription } from "./redux/slices/subscriptions"
import Settings from "./containers/admin-portal/settings"

const NotFound = lazy(() => import("./components/404-notfound/NotFound"))
const ComingSoon = lazy(() => import("./components/comming-soon/CommingSoon"))
const PremiumModal = lazy(() => import("./components/modals/PremiumModal"))

// Authentication Pages
const Login = lazy(() => import("./containers/common/login/Login"))
const Register = lazy(() => import("./containers/common/register/Register"))
const ResetPassword = lazy(() =>
  import("./containers/common/reset-password/ResetPassword")
)

// OAuth Callbacks
const GoogleCallback = lazy(() =>
  import("./containers/callbacks/google-callback")
)
const GithubCallback = lazy(() =>
  import("./containers/callbacks/github-callback")
)

// Subscription Routes
const SubscriptionPlans = lazy(() =>
  import("./containers/common/subscription-plans/SubscriptionPlans")
)

// User Portal Pages
const Dashboard = lazy(() =>
  import("./containers/user-portal/dashboard/Dashboard")
)
const Backups = lazy(() => import("./containers/user-portal/backups/Backups"))
const InvitedMembers = lazy(() =>
  import("./containers/user-portal/invited-members/InvitedMembers")
)
const UpgradePlans = lazy(() =>
  import("./containers/user-portal/upgrade-plans/UpgradePlans")
)
const MarkmapCanvas = lazy(() =>
  import("./components/markmap/markmap-canvas/MarkmapCanvas")
)
const UserPrivacyPolicy = lazy(() =>
  import("./containers/user-portal/privacy-policy")
)
const UserTermsOfService = lazy(() =>
  import("./containers/user-portal/terms-of-service")
)


// Admin Portal Pages
const UserTable = lazy(() =>
  import("./containers/admin-portal/users-management")
)
const StructureCatalogs = lazy(() =>
  import("./containers/admin-portal/structure-catalogs")
)
const UserProfiles = lazy(() =>
  import("./containers/admin-portal/user-profile")
)
const SubscriptionTable = lazy(() =>
  import("./containers/admin-portal/subscription-management")
)
const AdminDashboard = lazy(() => import("./containers/admin-portal/dashboard"))
const PrivacyPolicy = lazy(() =>
  import("./containers/admin-portal/admin-privacy-policy")
)
const TermsofService = lazy(() =>
  import("./containers/admin-portal/admin-terms-service")
)
const AdminLogin = lazy(() => import("./containers/admin-portal/admin-login"))

// Route Grouping
const authRoutes = [
  { path: "/", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/admin-portal", element: <AdminLogin /> },
]

const callbackRoutes = [
  { path: "/app/google-callback", element: <GoogleCallback /> },
  { path: "/app/github-callback", element: <GithubCallback /> },
]

const subscriptionRoutes = [
  { path: "/subscription-plans", element: <SubscriptionPlans /> },
]

const publicRoutes = [
  ...authRoutes,
  ...callbackRoutes,
  ...subscriptionRoutes,
  { path: "*", element: <NotFound /> },
]

const userRoutes = [
  { path: "/app/dashboard", element: <Dashboard /> },
  { path: "/app/backups", element: <Backups /> },
  { path: "/app/invited-members", element: <InvitedMembers /> },
  { path: "/app/upgrade-plans", element: <UpgradePlans /> },
  { path: "/app/privacy-policy", element: <UserPrivacyPolicy /> },
  { path: "/app/terms-of-service", element: <UserTermsOfService /> },
  { path: "/app/s/:username/:structureId", element: <MarkmapCanvas /> },
  { path: "/app/coming-soon", element: <ComingSoon /> },
]

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
  { path: "/app/admin-portal/settings", element: <Settings/> },
]

const App = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const userId = Cookies.get("atlas_userId")
  const [currentPlan, setCurrentPlan] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)

  useEffect(() => {
    if (userId) {
      dispatch(fetchSubscription(userId)).then(res => {
        setCurrentPlan(res.payload?.plan?.name)
      })
    }
  }, [dispatch, userId])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    setIsModalVisible(params.get("plan") === "upgrade-to-premium")
  }, [location.search])

  const closeModal = () => {
    setIsModalVisible(false)
    const params = new URLSearchParams(location.search)
    params.delete("plan")
    navigate({ search: params.toString() }, { replace: true })
  }

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
  )
}

export default App
