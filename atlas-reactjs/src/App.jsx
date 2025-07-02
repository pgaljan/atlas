import React, { Suspense, lazy, useEffect, useState } from "react"
import { Route, Routes, useLocation, useNavigate } from "react-router-dom"
import Settings from "./containers/admin-portal/settings"
import AdminPrivateRoute from "./routes/AdminPrivateRoute"
import PrivateRoute from "./routes/PrivateRoute"
import PublicRoute from "./routes/PublicRoute"
import { registerLicense } from "@syncfusion/ej2-base"
import { fetchAppSettings } from "./redux/slices/app-settings"
import { useDispatch } from "react-redux"
registerLicense(import.meta.env.VITE_SYNCFUSION_LICENSE_KEY)
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
const Syncfusion = lazy(() => import("./containers/user-portal/sync-fusion"))
const Backups = lazy(() => import("./containers/user-portal/backups/Backups"))
const InvitedMembers = lazy(() =>
  import("./containers/user-portal/invited-members/InvitedMembers")
)
const UpgradePlans = lazy(() =>
  import("./containers/user-portal/upgrade-plans/UpgradePlans")
)
const StructureRenderer = lazy(() =>
  import("./components/renders/StructureRenderer")
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
  { path: "/app/syncfusion", element: <Syncfusion /> },
  { path: "/app/privacy-policy", element: <UserPrivacyPolicy /> },
  { path: "/app/terms-of-service", element: <UserTermsOfService /> },
  { path: "/app/s/:username/:structureId", element: <StructureRenderer /> },
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
  { path: "/app/admin-portal/settings", element: <Settings /> },
]

const App = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const [isModalVisible, setIsModalVisible] = useState(false)

  useEffect(() => {
    const loadAndSetColorsAndTitle = async () => {
      try {
        const resultAction = await dispatch(fetchAppSettings())
        if (fetchAppSettings.fulfilled.match(resultAction)) {
          const settings = resultAction.payload

          if (settings?.primaryColor) {
            document.documentElement.style.setProperty(
              "--primary-color",
              settings.primaryColor
            )
          }

          if (settings?.secondaryColor) {
            document.documentElement.style.setProperty(
              "--secondary-color",
              settings.secondaryColor
            )
          }

          const newTitle = settings?.appName || "Atlas"
          localStorage.setItem("appName", newTitle)
          document.title = newTitle
        }
      } catch (error) {
        console.error("Failed to load theme colors or update title:", error)
      }
    }

    loadAndSetColorsAndTitle()
  }, [dispatch])

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
        </Routes>

        {isModalVisible && <PremiumModal closeModal={closeModal} />}
      </Suspense>
    </div>
  )
}

export default App
