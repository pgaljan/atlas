import React, { Suspense, lazy, useState, useEffect } from "react"
import { Route, Routes, useLocation, useNavigate } from "react-router-dom"
import PremiumModal from "./components/modals/PremiumModal"
import Support from "./containers/user/support/Support"
import PrivateRoute from "./routes/PrivateRoute"
import PublicRoute from "./routes/PublicRoute"

const NotFound = lazy(() => import("./components/404-notfound/NotFound"))
const MarkmapCanvas = lazy(() =>
  import("./components/markmap/markmap-canvas/MarkmapCanvas")
)
const Profile = lazy(() => import("./containers/user/profile/Profile"))
const Login = lazy(() => import("./containers/common/login/Login"))
const Register = lazy(() => import("./containers/common/register/Register"))
const ResetPassword = lazy(() =>
  import("./containers/common/reset-password/ResetPassword")
)
const SubscriptionPlans = lazy(() =>
  import("./containers/common/subscription-plans/SubscriptionPlans")
)
const Backups = lazy(() => import("./containers/user/backups/Backups"))
const Dashboard = lazy(() => import("./containers/user/dashboard/Dashboard"))
const UploadedFiles = lazy(() =>
  import("./containers/user/uploaded-files/UploadedFiles")
)
const UpgradePlans = lazy(() =>
  import("./containers/user/upgrade-plans/UpgradePlans")
)
const TeamMembers = lazy(() =>
  import("./containers/user/team-members/TeamMembers")
)
const DeletedMindmaps = lazy(() =>
  import("./containers/user/deleted-markmaps/DeletedMarkmaps")
)

const App = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isModalVisible, setIsModalVisible] = useState(false)

  useEffect(() => {
    const showPremiumModal =
      new URLSearchParams(location.search).get("plan") === "upgrade-to-premium"
    setIsModalVisible(showPremiumModal)
  }, [location.search])

  // Handle modal visibility
  const closeModal = () => {
    setIsModalVisible(false)

    // Remove 'plan' from URL
    const params = new URLSearchParams(location.search)
    params.delete("plan")
    navigate({ search: params.toString() }, { replace: true })
  }

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
          <Route
            path="/app/team-members"
            element={
              <PrivateRoute>
                <TeamMembers />
              </PrivateRoute>
            }
          />
          <Route
            path="/app/support"
            element={
              <PrivateRoute>
                <Support />
              </PrivateRoute>
            }
          />
          <Route
            path="/app/me"
            element={
              <PrivateRoute>
                <Profile />
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
            path="/app/uploaded-files"
            element={
              <PrivateRoute>
                <UploadedFiles />
              </PrivateRoute>
            }
          />
          <Route
            path="/app/deleted-markmaps"
            element={
              <PrivateRoute>
                <DeletedMindmaps />
              </PrivateRoute>
            }
          />

          <Route
            path="/app/upgrade-plans"
            element={
              <PrivateRoute>
                <UpgradePlans />
              </PrivateRoute>
            }
          />

          <Route
            path="*"
            element={
              <PublicRoute>
                <NotFound />
              </PublicRoute>
            }
          />
        </Routes>

        {/* Show the PremiumModal if visible */}
        {isModalVisible && <PremiumModal closeModal={closeModal} />}
      </Suspense>
    </div>
  )
}

export default App
