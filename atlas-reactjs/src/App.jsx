registerLicense(import.meta.env.VITE_SYNCFUSION_LICENSE_KEY)

import { registerLicense } from "@syncfusion/ej2-base";
import { Suspense, lazy, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Settings from "./containers/admin-portal/settings";
import { fetchAppSettings } from "./redux/slices/app-settings";
import AdminPrivateRoute from "./routes/AdminPrivateRoute";
import APIKeyPrivateRoute from "./routes/APIKeyPrivateRoute";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
const NotFound = lazy(() => import("./components/404-notfound/NotFound"));
const ComingSoon = lazy(() => import("./components/comming-soon"));
const PremiumModal = lazy(() => import("./components/modals/PremiumModal"));

// Authentication Pages
const Login = lazy(() => import("./containers/common/login"));
const Policy = lazy(() => import("./containers/common/privacy-policy"));
const Terms = lazy(() => import("./containers/common/terms-of-service"));

const Register = lazy(() => import("./containers/common/register"));
const ForgotPassword = lazy(() =>
  import("./containers/common/forgot-password")
);
const ResetPassword = lazy(() => import("./containers/common/reset-password"));

// OAuth Callbacks
const GoogleCallback = lazy(() =>
  import("./containers/callbacks/google-callback")
)
const GithubCallback = lazy(() =>
  import("./containers/callbacks/github-callback")
)

// Subscription Routes
const SubscriptionPlans = lazy(() =>
  import("./containers/common/subscription-plans")
)

// User Portal Pages
const Dashboard = lazy(() => import("./containers/user-portal/dashboard"))
const Syncfusion = lazy(() => import("./containers/user-portal/sync-fusion"))
const Backups = lazy(() => import("./containers/user-portal/backups"))
const Templates = lazy(() => import("./containers/user-portal/templates"))
const Invitations = lazy(() => import("./containers/user-portal/invitations"))
const UserSettings = lazy(() =>
  import("./containers/user-portal/user-settings")
)
const UpgradePlans = lazy(() =>
  import("./containers/user-portal/upgrade-plans")
)
const StructureRenderer = lazy(() =>
  import("./components/renderers/StructureRenderer")
)
const UserPrivacyPolicy = lazy(() =>
  import("./containers/user-portal/privacy-policy")
)
const UserTermsOfService = lazy(() =>
  import("./containers/user-portal/terms-of-service")
)

// Admin Portal Pages
const UserTable = lazy(() =>
  import("./containers/admin-portal/users-mgmt/index")
)
const StructureCatalogs = lazy(() =>
  import("./containers/admin-portal/structure-catalogs")
)
const UserProfiles = lazy(() =>
  import("./containers/admin-portal/user-profile")
)
const SubscriptionTable = lazy(() =>
  import("./containers/admin-portal/subscription-mgmt")
)
const AdminDashboard = lazy(() => import("./containers/admin-portal/dashboard"))
const PrivacyPolicy = lazy(() =>
  import("./containers/admin-portal/admin-privacy-policy")
)
const TermsofService = lazy(() =>
  import("./containers/admin-portal/admin-terms-service")
)
const AdminLogin = lazy(() => import("./containers/admin-portal/admin-login"))

// API Management Pages
const Overview = lazy(() => import("./containers/api-management/overview"))
const FavoriteAPIs = lazy(() =>
  import("./containers/api-management/favorites-apis")
)
const ActivityOverview = lazy(() =>
  import("./containers/api-management/activity-overview")
)
const Explore = lazy(() => import("./containers/api-management/explore"))
const APIs = lazy(() => import("./containers/api-management/apis"))
const TryIt = lazy(() => import("./containers/api-management/try-it"))
const APITemplates = lazy(() =>
  import("./containers/api-management/api-templates")
)
const Examples = lazy(() => import("./containers/api-management/examples"))
const Webhooks = lazy(() => import("./containers/api-management/webhooks"))
const Support = lazy(() => import("./containers/api-management/support"))

const APIKeys = lazy(() => import("./containers/api-management/security-keys"))
const Policies = lazy(() =>
  import("./containers/api-management/security-policies")
)
const Certificates = lazy(() =>
  import("./containers/api-management/security-certificates")
)

// Route Grouping
const authRoutes = [
  { path: "/", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/admin-portal", element: <AdminLogin /> },
  { path: "/privacy-policy", element: <Policy /> },
  { path: "/terms-of-service", element: <Terms /> },
];

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
  { path: "/app/templates", element: <Templates /> },
  { path: "/app/invitations", element: <Invitations /> },
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
]

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

          const newTitle = settings?.appName || "Atlas";
          document.title = newTitle;

          if (settings?.logoUrl) {
            const baseUrl = window.location.origin
            const logoUrl = settings.logoUrl.startsWith("http")
              ? settings.logoUrl
              : `${baseUrl}${settings.logoUrl}`

            const faviconUrl = `${logoUrl}?v=${Date.now()}`

            const existingIcons = document.querySelectorAll("link[rel~='icon']")
            existingIcons.forEach(icon => icon.remove())

            const newFavicon = document.createElement("link")
            newFavicon.rel = "icon"
            newFavicon.type = "image/png"
            newFavicon.href = faviconUrl
            document.head.appendChild(newFavicon)
          }
        }
      } catch (error) {
        cogoToast.error(
          `Failed to load app settings: ${
            error?.message || "Unknown error occurred"
          }`
        )
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
  )
}

export default App
