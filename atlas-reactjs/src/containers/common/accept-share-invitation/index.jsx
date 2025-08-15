import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import Cookies from "js-cookie"
import cogoToast from "@successtar/cogo-toast"
import {
  FiCheck,
  FiX,
  FiUser,
  FiSettings,
  FiEye,
  FiMessageCircle,
  FiMail,
  FiClock,
} from "react-icons/fi"
import {
  acceptShareInvitation,
  declineShareInvitation,
} from "../../../redux/slices/structure-sharing"

const AcceptShareInvitation = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(false)
  const [invitationDetails, setInvitationDetails] = useState(null)
  const [error, setError] = useState(null)
  const [actionTaken, setActionTaken] = useState(null) // 'accepted' | 'declined'

  // Check if user is logged in
  const isLoggedIn = !!Cookies.get("atlas_token")
  const user = useSelector(state => state.auth?.user || null)

  // Permission configuration for display
  const permissionConfig = {
    owner: {
      label: "Owner",
      description: "Full control - can add collaborators, edit, and export",
      icon: FiSettings,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    collaborator: {
      label: "Can edit",
      description: "Can edit structure map and records",
      icon: FiUser,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    commenter: {
      label: "Can comment",
      description: "Can browse and comment on structure map and records",
      icon: FiMessageCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    viewer: {
      label: "Can view",
      description: "Can browse and export structure map and records",
      icon: FiEye,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    },
  }

  useEffect(() => {
    // If no token, redirect to 404
    if (!token) {
      navigate("/404", { replace: true })
      return
    }

    // Check if user needs to log in
    if (!isLoggedIn) {
      // Store the invitation token to redirect back after login
      sessionStorage.setItem("pending_invitation_token", token)
      cogoToast.warn("Please log in to accept this invitation")
      navigate(`/register?redirect=accept-invitation&token=${token}`, {
        replace: true,
      })
      return
    }
  }, [token, isLoggedIn, navigate])

  const handleAcceptInvitation = async () => {
    if (!token) {
      cogoToast.error("Invalid invitation token")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await dispatch(acceptShareInvitation(token)).unwrap()

      setInvitationDetails(result.structure)
      setActionTaken("accepted")

      cogoToast.success("Invitation accepted successfully!")

      // Redirect to dashboard after a delay
      setTimeout(() => {
        navigate("/app/dashboard")
      }, 3000)
    } catch (error) {
      const errorMessage = error?.message || "Failed to accept invitation"
      setError(errorMessage)
      cogoToast.error(errorMessage)

      // Handle specific error cases
      if (errorMessage.includes("register first")) {
        cogoToast.warn("Please register an account first")
        navigate(`/register?redirect=accept-invitation&token=${token}`)
      } else if (errorMessage.includes("already have access")) {
        cogoToast.info("You already have access to this structure")
        navigate("/app/dashboard")
      } else if (errorMessage.includes("expired")) {
        cogoToast.error("This invitation has expired")
      } else if (errorMessage.includes("Invalid")) {
        cogoToast.error("This invitation is invalid or has already been used")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeclineInvitation = async () => {
    if (!token) {
      cogoToast.error("Invalid invitation token")
      return
    }

    setLoading(true)
    setError(null)

    try {
      await dispatch(declineShareInvitation(token)).unwrap()
      setActionTaken("declined")
      cogoToast.info("Invitation declined")

      // Redirect to dashboard after a delay
      setTimeout(() => {
        navigate("/app/dashboard")
      }, 2000)
    } catch (error) {
      const errorMessage = error?.message || "Failed to decline invitation"
      setError(errorMessage)
      cogoToast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const goToDashboard = () => {
    navigate("/app/dashboard")
  }

  const goToLogin = () => {
    sessionStorage.setItem("pending_invitation_token", token)
    navigate(`/?redirect=accept-invitation&token=${token}`)
  }

  // Show loading state
  if (loading && !actionTaken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Processing your request...
            </h2>
            <p className="text-gray-600">
              Please wait while we process your invitation.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show success state after accepting
  if (actionTaken === "accepted" && invitationDetails) {
    const config =
      permissionConfig[invitationDetails.permission] || permissionConfig.viewer
    const Icon = config.icon

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="w-8 h-8 text-green-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Invitation Accepted!
            </h2>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                {invitationDetails.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {invitationDetails.description}
              </p>

              <div className="flex items-center justify-center space-x-2">
                <Icon className={`w-4 h-4 ${config.color}`} />
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}
                >
                  {config.label}
                </span>
              </div>

              {invitationDetails.owner && (
                <p className="text-xs text-gray-500 mt-2">
                  Shared by {invitationDetails.owner.name}
                </p>
              )}
            </div>

            <p className="text-gray-600 mb-4">
              You now have {config.label.toLowerCase()} access to this
              structure.
            </p>

            <p className="text-sm text-gray-500 mb-6">
              Redirecting to dashboard in a few seconds...
            </p>

            <button
              onClick={goToDashboard}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show decline confirmation
  if (actionTaken === "declined") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiX className="w-8 h-8 text-gray-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Invitation Declined
            </h2>
            <p className="text-gray-600 mb-4">
              You have declined this structure invitation.
            </p>

            <p className="text-sm text-gray-500 mb-6">
              Redirecting to dashboard...
            </p>

            <button
              onClick={goToDashboard}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiX className="w-8 h-8 text-red-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Unable to Process Invitation
            </h2>
            <p className="text-red-600 mb-4">{error}</p>

            <div className="space-y-2">
              {!isLoggedIn ? (
                <button
                  onClick={goToLogin}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Go to Login
                </button>
              ) : (
                <button
                  onClick={goToDashboard}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Go to Dashboard
                </button>
              )}

              <button
                onClick={() => navigate("/")}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main invitation screen (when not logged in or need to show invitation details)
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMail className="w-8 h-8 text-blue-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Structure Invitation
            </h2>
            <p className="text-gray-600 mb-6">
              You've been invited to collaborate on a structure. Please log in
              to accept this invitation.
            </p>

            <div className="space-y-3">
              <button
                onClick={goToLogin}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Log In to Accept
              </button>

              <button
                onClick={() =>
                  navigate(
                    `/register?redirect=accept-invitation&token=${token}`
                  )
                }
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default invitation acceptance screen (when logged in)
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiMail className="w-8 h-8 text-blue-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Structure Invitation
          </h2>

          {user && (
            <p className="text-sm text-gray-500 mb-4">
              Logged in as {user.email}
            </p>
          )}

          <p className="text-gray-600 mb-6">
            You've been invited to collaborate on a structure. Would you like to
            accept this invitation?
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-yellow-800">
              <FiClock className="w-4 h-4" />
              <span className="text-sm font-medium">
                This invitation may have specific permissions and expiration.
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleAcceptInvitation}
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md transition-colors ${
                loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {loading ? "Processing..." : "Accept Invitation"}
            </button>

            <button
              onClick={handleDeclineInvitation}
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md transition-colors ${
                loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {loading ? "Processing..." : "Decline Invitation"}
            </button>

            <button
              onClick={goToDashboard}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AcceptShareInvitation
