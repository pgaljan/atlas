// src/App.jsx
import { registerLicense } from '@syncfusion/ej2-base';
registerLicense(import.meta.env.VITE_SYNCFUSION_LICENSE_KEY);

import { Suspense, lazy, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import cogoToast from '@successtar/cogo-toast';
import { fetchAppSettings } from './redux/slices/app-settings';

// Layouts
import Layout from './components/layout';
import AdminLayout from './components/admin/admin-layout';
import LearnerPlatformLayout from './components/learner-platform/learner-layout/LearnerPlatformLayout';
import CleanSheetContentLayout from './components/cleansheet/layout-cleansheet/content-library-layout/CleanSheetContentLayout';
import CleanSheetLayout from './components/cleansheet/layout-cleansheet';

// Route wrappers
import PublicRoute from './routes/PublicRoute';
import PrivateRoute from './routes/PrivateRoute';
import AdminPrivateRoute from './routes/AdminPrivateRoute';
import APIKeyPrivateRoute from './routes/APIKeyPrivateRoute';
import LearnerPrivateRoutes from './routes/LearnerPrivateRoutes';
import { setFaviconWithFallback } from './utils/faviconFallback';
import CleansheetPrivateRoute from './routes/CleanSheetPrivateRoute';
import ExperienceTriggerLayout from './components/cleansheet/layout-cleansheet/experience-trigger-layout/ExperienceTriggerLayout';
import CleansheetCanvasLayout from './components/cleansheet/layout-cleansheet/cleansheet-canvas-layout/CleanSheetCanvasLayout';

// --- CleanSheet ---
const CleanSheetPlatform = lazy(() => import('./containers/common/cleansheet/cleansheet-platform'));

const ContentLibrary = lazy(
  () => import('./containers/common/cleansheet/cleansheet-content-library'),
);
const ExperienceTrigger = lazy(
  () => import('./containers/common/cleansheet/cleansheet-experience-trigger'),
);
const CleanSheetCanvas = lazy(() => import('./containers/common/cleansheet/cleansheet-canvas'));
// Lazy imports (rest of app)
const NotFound = lazy(() => import('./components/404-notfound/NotFound'));
const ComingSoon = lazy(() => import('./components/comming-soon'));
const PremiumModal = lazy(() => import('./components/modals/PremiumModal'));

// Auth
const Login = lazy(() => import('./containers/common/login'));
const Register = lazy(() => import('./containers/common/register'));
const ForgotPassword = lazy(() => import('./containers/common/forgot-password'));
const ResetPassword = lazy(() => import('./containers/common/reset-password'));
const Policy = lazy(() => import('./containers/common/privacy-policy'));
const Terms = lazy(() => import('./containers/common/terms-of-service'));

// OAuth
const GoogleCallback = lazy(() => import('./containers/callbacks/google-callback'));
const GithubCallback = lazy(() => import('./containers/callbacks/github-callback'));
const ShareCallback = lazy(() => import('./containers/callbacks/share-callback'));

// Subscription
const SubscriptionPlans = lazy(() => import('./containers/common/subscription-plans'));

// User Portal
const Dashboard = lazy(() => import('./containers/user-portal/dashboard'));
const Syncfusion = lazy(() => import('./containers/user-portal/sync-fusion'));
const Backups = lazy(() => import('./containers/user-portal/backups'));
const SharedStructures = lazy(() => import('./containers/user-portal/shared-structures'));
const Templates = lazy(() => import('./containers/user-portal/templates'));
const Invitations = lazy(() => import('./containers/user-portal/invitations'));
const UserSettings = lazy(() => import('./containers/user-portal/user-settings'));
const UpgradePlans = lazy(() => import('./containers/user-portal/upgrade-plans'));
const StructureRenderer = lazy(() => import('./components/renderers/StructureRenderer'));
const UserPrivacyPolicy = lazy(() => import('./containers/user-portal/privacy-policy'));
const UserTermsOfService = lazy(() => import('./containers/user-portal/terms-of-service'));

// Admin
const AdminLogin = lazy(() => import('./containers/admin-portal/admin-login'));
const AdminDashboard = lazy(() => import('./containers/admin-portal/dashboard'));
const UserTable = lazy(() => import('./containers/admin-portal/users-mgmt'));
const StructureCatalogs = lazy(() => import('./containers/admin-portal/structure-catalogs'));
const UserProfiles = lazy(() => import('./containers/admin-portal/user-profile'));
const SubscriptionTable = lazy(() => import('./containers/admin-portal/subscription-mgmt'));
const PrivacyPolicy = lazy(() => import('./containers/admin-portal/admin-privacy-policy'));
const TermsofService = lazy(() => import('./containers/admin-portal/admin-terms-service'));
const Settings = lazy(() => import('./containers/admin-portal/settings'));

// API Management
const Overview = lazy(() => import('./containers/api-management/overview'));
const FavoriteAPIs = lazy(() => import('./containers/api-management/favorites-apis'));
const ActivityOverview = lazy(() => import('./containers/api-management/activity-overview'));
const Explore = lazy(() => import('./containers/api-management/explore'));
const APIs = lazy(() => import('./containers/api-management/apis'));
const TryIt = lazy(() => import('./containers/api-management/try-it'));
const APITemplates = lazy(() => import('./containers/api-management/api-templates'));
const Examples = lazy(() => import('./containers/api-management/examples'));
const Webhooks = lazy(() => import('./containers/api-management/webhooks'));
const Support = lazy(() => import('./containers/api-management/support'));
const APIKeys = lazy(() => import('./containers/api-management/security-keys'));
const Policies = lazy(() => import('./containers/api-management/security-policies'));
const Certificates = lazy(() => import('./containers/api-management/security-certificates'));

// Learner Platform
const LearnerMyPath = lazy(() => import('./containers/learner-platform/learner-my-path'));
const LearnerCanvas = lazy(() => import('./containers/learner-platform/learner-my-canvas'));
const LearnerQuarters = lazy(() => import('./containers/learner-platform/learner-my-quarters'));
const LearnerMessages = lazy(() => import('./containers/learner-platform/learner-messages'));
const LeanerAccountSettings = lazy(
  () => import('./containers/learner-platform/learner-my-account'),
);

// Route groups (keeps same structure as previous working version)
const publicRoutes = [
  { path: '/', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/admin-portal', element: <AdminLogin /> },
  { path: '/privacy-policy', element: <Policy /> },
  { path: '/terms-of-service', element: <Terms /> },
  { path: '*', element: <NotFound /> },
];

const callbackRoutes = [
  { path: '/app/google-callback', element: <GoogleCallback /> },
  { path: '/app/github-callback', element: <GithubCallback /> },
  { path: '/app/share-callback/accept-invitation', element: <ShareCallback /> },
];

const subscriptionRoutes = [{ path: '/subscription-plans', element: <SubscriptionPlans /> }];

const userRoutes = [
  { path: '/app/dashboard', element: <Dashboard /> },
  { path: '/app/backups', element: <Backups /> },
  { path: '/app/shared-with-me', element: <SharedStructures /> },
  { path: '/app/templates', element: <Templates /> },
  { path: '/app/invitations', element: <Invitations /> },
  { path: '/app/upgrade-plans', element: <UpgradePlans /> },
  { path: '/app/syncfusion', element: <Syncfusion /> },
  { path: '/app/privacy-policy', element: <UserPrivacyPolicy /> },
  { path: '/app/terms-of-service', element: <UserTermsOfService /> },
  { path: '/app/s/:username/:structureId', element: <StructureRenderer /> },
  { path: '/app/coming-soon', element: <ComingSoon /> },
  { path: '/app/user-settings', element: <UserSettings /> },
];

const adminRoutes = [
  { path: '/app/admin-portal/user-management', element: <UserTable /> },
  { path: '/app/admin-portal/structure-Catalogs', element: <StructureCatalogs /> },
  { path: '/app/admin-portal/user-profile', element: <UserProfiles /> },
  { path: '/app/admin-portal/subscription-plan', element: <SubscriptionTable /> },
  { path: '/app/admin-portal/dashboard', element: <AdminDashboard /> },
  { path: '/app/admin-portal/policy', element: <PrivacyPolicy /> },
  { path: '/app/admin-portal/terms-of-service', element: <TermsofService /> },
  { path: '/app/admin-portal/settings', element: <Settings /> },
];

const apiManagementRoutes = [
  { path: '/api-management/overview', element: <Overview /> },
  { path: '/api-management/favorites/apis', element: <FavoriteAPIs /> },
  { path: '/api-management/favorites/activity-overview', element: <ActivityOverview /> },
  { path: '/api-management/explore', element: <Explore /> },
  { path: '/api-management/apis', element: <APIs /> },
  { path: '/api-management/try-it', element: <TryIt /> },
  { path: '/api-management/api-templates', element: <APITemplates /> },
  { path: '/api-management/examples', element: <Examples /> },
  { path: '/api-management/webhooks', element: <Webhooks /> },
  { path: '/api-management/support', element: <Support /> },
  { path: '/api-management/security/keys', element: <APIKeys /> },
  { path: '/api-management/security/policies', element: <Policies /> },
  { path: '/api-management/security/certificates', element: <Certificates /> },
];

const learnerPlatformRoutes = [
  { path: '/learner/dashboard', element: <LearnerMyPath /> },
  { path: '/learner/my-canvas', element: <LearnerCanvas /> },
  { path: '/learner/my-quarters', element: <LearnerQuarters /> },
  { path: '/learner/messages', element: <LearnerMessages /> },
  { path: '/learner/account-settings', element: <LeanerAccountSettings /> },
];

const App = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const applyDefaults = () => {
      document.documentElement.style.setProperty('--primary-color', '#660000');
      document.documentElement.style.setProperty('--secondary-color', '#006666');
      document.title = 'Atlas';
    };

    const loadAndSetColorsAndTitle = async () => {
      try {
        const resultAction = await dispatch(fetchAppSettings());
        if (fetchAppSettings.fulfilled.match(resultAction)) {
          const settings = resultAction.payload;

          const primaryColor = settings?.primaryColor || '#4F46E5';
          const secondaryColor = settings?.secondaryColor || '#10B981';
          const appName = settings?.appName || 'Atlas';
          const logoUrl = settings?.logoUrl || '/default-logo.png';

          document.documentElement.style.setProperty('--primary-color', primaryColor);
          document.documentElement.style.setProperty('--secondary-color', secondaryColor);
          document.title = appName;

          const baseUrl = window.location.origin;
          const resolvedLogoUrl = logoUrl.startsWith('http') ? logoUrl : `${baseUrl}${logoUrl}`;
          const faviconUrl = `${resolvedLogoUrl}?v=${Date.now()}`;
          setFaviconWithFallback(faviconUrl, '/assets/atlas-logo.png');

          const existingIcons = document.querySelectorAll("link[rel~='icon']");
          existingIcons.forEach((icon) => icon.remove());

          const newFavicon = document.createElement('link');
          newFavicon.rel = 'icon';
          newFavicon.type = 'image/png';
          newFavicon.href = faviconUrl;
          document.head.appendChild(newFavicon);
        } else {
          applyDefaults();
        }
      } catch (error) {
        applyDefaults();
        cogoToast.error(
          `Failed to load app settings: ${error?.message || 'Unknown error occurred'}`,
        );
      }
    };

    applyDefaults();
    loadAndSetColorsAndTitle();
  }, [dispatch]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setIsModalVisible(params.get('plan') === 'upgrade-to-premium');
  }, [location.search]);

  const closeModal = () => {
    setIsModalVisible(false);
    const params = new URLSearchParams(location.search);
    params.delete('plan');
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
          {/*  Public Routes */}
          {publicRoutes?.map(({ path, element }) => (
            <Route key={path} path={path} element={<PublicRoute>{element}</PublicRoute>} />
          ))}

          {/*  Callback Routes */}
          {callbackRoutes?.map(({ path, element }) => (
            <Route key={path} path={path} element={<PublicRoute>{element}</PublicRoute>} />
          ))}

          {/*  Subscription Routes */}
          {subscriptionRoutes?.map(({ path, element }) => (
            <Route key={path} path={path} element={<PublicRoute>{element}</PublicRoute>} />
          ))}

          {/*  User Portal (protected, inside main Layout) */}
          <Route
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            {userRoutes?.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Route>

          {/*  Admin Portal */}
          <Route
            element={
              <AdminPrivateRoute>
                <AdminLayout />
              </AdminPrivateRoute>
            }
          >
            {adminRoutes?.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Route>

          {/*  API Management */}
          <Route element={<APIKeyPrivateRoute />}>
            {apiManagementRoutes?.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Route>

          {/*  Learner Platform */}
          <Route
            element={
              <LearnerPrivateRoutes>
                <LearnerPlatformLayout />
              </LearnerPrivateRoutes>
            }
          >
            {learnerPlatformRoutes?.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Route>

          {/*  CleanSheet — base dashboard */}
          <Route
            path="/cleansheet"
            element={
              <CleansheetPrivateRoute>
                <CleanSheetLayout />
              </CleansheetPrivateRoute>
            }
          >
            <Route index element={<CleanSheetPlatform />} />
          </Route>

          <Route
            path="/cleansheet/content-library"
            element={
              <CleansheetPrivateRoute>
                <CleanSheetContentLayout />
              </CleansheetPrivateRoute>
            }
          >
            <Route index element={<ContentLibrary />} />
          </Route>
          <Route
            path="/cleansheet/experience-trigger"
            element={
              <CleansheetPrivateRoute>
                <ExperienceTriggerLayout />
              </CleansheetPrivateRoute>
            }
          >
            <Route index element={<ExperienceTrigger />} />
          </Route>
          <Route
            path="/cleansheet/career-canvas"
            element={
              <CleansheetPrivateRoute>
                <CleansheetCanvasLayout />
              </CleansheetPrivateRoute>
            }
          >
            <Route index element={<CleanSheetCanvas />} />
          </Route>
        </Routes>

        {isModalVisible && <PremiumModal closeModal={closeModal} />}
      </Suspense>
    </div>
  );
};

export default App;
