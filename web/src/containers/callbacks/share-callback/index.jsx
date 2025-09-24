// src/pages/share/ShareCallback.jsx
import cogoToast from "@successtar/cogo-toast"
import Cookies from "js-cookie"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useSearchParams, useLocation } from "react-router-dom"
import { FiLoader, FiCheckCircle, FiAlertCircle } from "react-icons/fi"
import {
  acceptInvitation,
  clearSharesState,
} from "../../../redux/slices/structure-sharing"
import { getStructuresByWorkspaceId } from "../../../redux/slices/structures"
import RendererModal from "../../../components/modals/RendererModal"
import { encryptPermission } from "../../../utils/encryptionCrypto"
import { isTokenValid } from "../../../middleware/axiosInstance"

const ShareCallback = () => {
  const [searchParams] = useSearchParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [status, setStatus] = useState("loading")
  const [errorMessage, setErrorMessage] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [invitationParams, setInvitationParams] = useState(null)

  const [showRendererModal, setShowRendererModal] = useState(false)
  const [sharedStructure, setSharedStructure] = useState(null)

  const { loading, error } = useSelector(state => state.structureShares || {})

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const valid = await isTokenValid()
      setIsAuthenticated(valid)

      if (!valid) {
        const token = searchParams.get("token")
        if (token) {
          // store pending invitation token only
          sessionStorage.setItem(
            "pendingInvitationToken",
            JSON.stringify({ token })
          )
          const returnUrl = encodeURIComponent(
            location.pathname + location.search
          )
          cogoToast.info("Please log in to accept this invitation")
          navigate(`/?returnUrl=${returnUrl}`, { replace: true })
        } else {
          // no token -> invalid link
          setStatus("error")
          setErrorMessage("Invalid invitation link")
        }
      }
    }

    checkAuth()
  }, [navigate, searchParams, location])

  // Restore invitation after login
  useEffect(() => {
    if (isAuthenticated === true) {
      const pending = sessionStorage.getItem("pendingInvitationToken")
      if (pending) {
        try {
          const params = JSON.parse(pending)
          setInvitationParams(params)

          // Ensure we are on /share/callback, otherwise redirect back here
          if (!location.pathname.includes("/share/callback")) {
            navigate(`/share/callback?token=${params.token}`, { replace: true })
            return
          }

          sessionStorage.removeItem("pendingInvitationToken")
        } catch (err) {
          // ignore parse error
        }
      }
    }
  }, [isAuthenticated, location, navigate])

  // Process invitation
  useEffect(() => {
    const processInvitation = async () => {
      const token = invitationParams?.token || searchParams.get("token")

      if (!token) {
        setStatus("error")
        setErrorMessage("Invalid invitation link")
        return
      }

      try {
        setStatus("loading")
        // acceptInvitation now takes { token } and uses auth
        const result = await dispatch(
          acceptInvitation({ token })
        ).unwrap()

        setStatus("success")
        cogoToast.success("Invitation accepted successfully!")

        // Prefer server-provided structureId/permission/ownerUsername
        const returnedStructureId = result?.structureId || null
        const returnedPermission = result?.permission || null
        const returnedOwnerUsername = result?.ownerUsername || null

        const workspaceId = Cookies.get("workspaceId")
        const currentUserId = Cookies.get("atlas_userId")

        // If we have the structural id + owner username from server — open immediately via modal.
        if (returnedStructureId && returnedOwnerUsername) {
          setSharedStructure({
            id: returnedStructureId,
            ownerUsername: returnedOwnerUsername,
            permission: returnedPermission || "",
            structureType: "default",
          })
          setShowRendererModal(true)
          return
        }

        // Otherwise, fetch structures in workspace (to get owner username / type)
        if (workspaceId && currentUserId) {
          try {
            const resp = await dispatch(
              getStructuresByWorkspaceId(workspaceId)
            ).unwrap()
            const structures = Array.isArray(resp?.payload)
              ? resp.payload
              : resp

            let matched = null

            if (returnedStructureId) {
              matched = (structures || []).find(
                s => String(s.id) === String(returnedStructureId)
              )
            }

            if (!matched) {
              matched = (structures || []).find(s => {
                const shares = s.shares || []
                const invites = s.shareInvitations || []
                const hasShare = shares.some(
                  sh => String(sh.userId) === String(currentUserId)
                )
                const hasAcceptedInvite = invites.some(inv => {
                  return (
                    inv.inviteeId &&
                    String(inv.inviteeId) === String(currentUserId) &&
                    inv.status === "accepted"
                  )
                })
                return hasShare || hasAcceptedInvite
              })
            }

            if (matched) {
              const ownerUsername =
                returnedOwnerUsername || matched.owner?.username || null

              const permFromShare = matched.shares?.find(
                sh => String(sh.userId) === String(currentUserId)
              )?.permission

              const permFromInvite = matched.shareInvitations?.find(
                inv =>
                  inv.inviteeId &&
                  String(inv.inviteeId) === String(currentUserId) &&
                  inv.status === "accepted"
              )?.permission

              const permission =
                returnedPermission || permFromShare || permFromInvite || ""

              if (!ownerUsername) {
                console.warn(
                  "Accept-invitation: owner username not available for structure",
                  matched.id
                )
                cogoToast.info(
                  "Invitation accepted but could not determine structure owner. Redirecting to dashboard."
                )
                navigate("/app/dashboard", { replace: true })
                return
              }

              setSharedStructure({
                id: matched.id,
                ownerUsername,
                permission,
                structureType: matched.type || "default",
              })
              setShowRendererModal(true)
              return
            }
          } catch (err) {
            // ignore
          }
        }

        // no metadata found — show neutral modal
        setSharedStructure(null)
        setShowRendererModal(true)
      } catch (err) {
        setStatus("error")
        const msg =
          err?.message || "Failed to accept invitation. Please try again."
        setErrorMessage(msg)
        cogoToast.error(msg)
        setTimeout(() => navigate("/app/dashboard", { replace: true }), 2000)
      }
    }

    if (
      isAuthenticated === true &&
      (searchParams.get("token") || invitationParams)
    ) {
      processInvitation()
    }

    return () => {
      dispatch(clearSharesState())
    }
  }, [dispatch, navigate, searchParams, isAuthenticated, invitationParams])

  // Renderer selection handler
  const handleRendererSelect = renderer => {
    setShowRendererModal(false)

    if (
      sharedStructure?.id &&
      sharedStructure?.ownerUsername &&
      sharedStructure?.permission
    ) {
      try {
        const enc = encryptPermission(sharedStructure.permission)
        const q = encodeURIComponent(enc)
        const url = `/app/s/${sharedStructure.ownerUsername}/${sharedStructure.id}?renderer=${renderer}&permission=${q}`

        window.history.replaceState(null, "", url)
        window.location.reload()
        return
      } catch (e) {
        cogoToast.error("Failed to open renderer (encryption error).")
        navigate("/app/dashboard", { replace: true })
        return
      }
    }

    cogoToast.info("Could not determine structure URL — opening dashboard.")
    navigate("/app/dashboard", { replace: true })
  }

  const renderContent = () => {
    if (isAuthenticated === null) {
      return (
        <div className="text-center">
          <FiLoader className="animate-spin w-12 h-12 text-custom-main mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Checking authentication...
          </h2>
          <p className="text-gray-600">
            Please wait while we verify your session...
          </p>
        </div>
      )
    }

    switch (status) {
      case "loading":
        return (
          <div className="text-center">
            <FiLoader className="animate-spin w-12 h-12 text-custom-main mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Processing Invitation
            </h2>
            <p className="text-gray-600">
              Please wait while we accept your invitation...
            </p>
          </div>
        )
      case "success":
        return (
          <div className="text-center">
            <FiCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Invitation Accepted!
            </h2>
            <p className="text-gray-600 mb-4">
              You have successfully joined the structure.
            </p>
            <p className="text-sm text-gray-500">
              Choose renderer to open the structure...
            </p>
          </div>
        )
      case "error":
        return (
          <div className="text-center">
            <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Invitation Failed
            </h2>
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
            <div className="mt-6">
              <button
                onClick={() => navigate("/app/dashboard", { replace: true })}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          {renderContent()}
        </div>
      </div>

      <RendererModal
        isOpen={showRendererModal}
        onClose={() => {
          setShowRendererModal(false)
          navigate("/app/dashboard", { replace: true })
        }}
        onSelect={handleRendererSelect}
        structureType={sharedStructure?.structureType || "default"}
      />
    </>
  )
}

export default ShareCallback
