// src/App.jsx
import { registerLicense } from '@syncfusion/ej2-base';
registerLicense(import.meta.env.VITE_SYNCFUSION_LICENSE_KEY);

import { Suspense, lazy, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import cogoToast from '@successtar/cogo-toast';
import { fetchAppSettings } from './redux/slices/app-settings';

import PublicRoute from './routes/PublicRoute';
import PrivateRoute from './routes/PrivateRoute';
import AdminPrivateRoute from './routes/AdminPrivateRoute';
import APIKeyPrivateRoute from './routes/APIKeyPrivateRoute';

// Layouts
import Layout from './components/layout';
import AdminLayout from './components/admin/admin-layout';

// Lazy imports
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
          {/* Public routes (no layout) */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin-portal" element={<AdminLogin />} />
            <Route path="/privacy-policy" element={<Policy />} />
            <Route path="/terms-of-service" element={<Terms />} />
            <Route path="/app/google-callback" element={<GoogleCallback />} />
            <Route path="/app/github-callback" element={<GithubCallback />} />
            <Route path="/app/share-callback/accept-invitation" element={<ShareCallback />} />
            <Route path="/subscription-plans" element={<SubscriptionPlans />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* User portal routes inside main Layout */}
          <Route
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route path="/app/dashboard" element={<Dashboard />} />
            <Route path="/app/backups" element={<Backups />} />
            <Route path="/app/templates" element={<Templates />} />
            <Route path="/app/invitations" element={<Invitations />} />
            <Route path="/app/upgrade-plans" element={<UpgradePlans />} />
            <Route path="/app/syncfusion" element={<Syncfusion />} />
            <Route path="/app/privacy-policy" element={<UserPrivacyPolicy />} />
            <Route path="/app/terms-of-service" element={<UserTermsOfService />} />
            <Route path="/app/s/:username/:structureId" element={<StructureRenderer />} />
            <Route path="/app/coming-soon" element={<ComingSoon />} />
            <Route path="/app/user-settings" element={<UserSettings />} />
          </Route>

          {/* Admin portal routes inside AdminLayout */}
          <Route
            element={
              <AdminPrivateRoute>
                <AdminLayout />
              </AdminPrivateRoute>
            }
          >
            <Route path="/app/admin-portal/user-management" element={<UserTable />} />
            <Route path="/app/admin-portal/structure-Catalogs" element={<StructureCatalogs />} />
            <Route path="/app/admin-portal/user-profile" element={<UserProfiles />} />
            <Route path="/app/admin-portal/subscription-plan" element={<SubscriptionTable />} />
            <Route path="/app/admin-portal/dashboard" element={<AdminDashboard />} />
            <Route path="/app/admin-portal/policy" element={<PrivacyPolicy />} />
            <Route path="/app/admin-portal/terms-of-service" element={<TermsofService />} />
            <Route path="/app/admin-portal/settings" element={<Settings />} />
          </Route>

          {/* API management routes (no sidebar layout, just wrapper) */}
          <Route element={<APIKeyPrivateRoute />}>
            <Route path="/api-management/overview" element={<Overview />} />
            <Route path="/api-management/favorites/apis" element={<FavoriteAPIs />} />
            <Route
              path="/api-management/favorites/activity-overview"
              element={<ActivityOverview />}
            />
            <Route path="/api-management/explore" element={<Explore />} />
            <Route path="/api-management/apis" element={<APIs />} />
            <Route path="/api-management/try-it" element={<TryIt />} />
            <Route path="/api-management/api-templates" element={<APITemplates />} />
            <Route path="/api-management/examples" element={<Examples />} />
            <Route path="/api-management/webhooks" element={<Webhooks />} />
            <Route path="/api-management/support" element={<Support />} />
            <Route path="/api-management/security/keys" element={<APIKeys />} />
            <Route path="/api-management/security/policies" element={<Policies />} />
            <Route path="/api-management/security/certificates" element={<Certificates />} />
          </Route>
        </Routes>

        {isModalVisible && <PremiumModal closeModal={closeModal} />}
      </Suspense>
    </div>
  );
};

export default App;
