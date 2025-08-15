import cogoToast from "@successtar/cogo-toast"
import { useEffect, useState, useCallback } from "react"
import {
  FiAlertCircle,
  FiClock,
  FiCopy,
  FiTrash2,
  FiUser,
  FiX,
  FiSettings,
  FiRefreshCw,
} from "react-icons/fi"
import { useDispatch, useSelector } from "react-redux"
import {
  fetchSharesForStructure,
  fetchCollaborators,
  fetchShareableLinks,
  createShareLink,
  revokeShareLink,
  fetchPendingInvitations,
  inviteUserToShare,
  removeCollaborator,
  updateShareRole,
} from "../../redux/slices/structure-sharing"
import { PERMISSION_LEVELS, PERMISSION_CONFIG } from "../../types/permissions"

// Utility functions
const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.trim())
// Main ShareModal Component
const ShareModal = ({ isOpen, onClose, structureId }) => {
  const user = useSelector(state => state.auth?.user || null)

  const dispatch = useDispatch()

  // State management
  const [email, setEmail] = useState("")
  const [selectedEmails, setSelectedEmails] = useState([])
  const [customMessage, setCustomMessage] = useState("")
  const [selectedPermission, setSelectedPermission] = useState(
    PERMISSION_LEVELS.EDITOR
  )
  const [activeTab, setActiveTab] = useState("invite")
  const [linkPermission, setLinkPermission] = useState(PERMISSION_LEVELS.VIEWER)
  const [emailError, setEmailError] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  // Redux state
  const {
    collaborators,
    pendingInvitations,
    links,
    shares,
    loading,
    error,
    status,
  } = useSelector(state => state.structureShares || {})

  // Define display data first
  const displayCollaborators = collaborators || []
  const displayShareLinks = (links || [])?.filter(l => l?.isActive !== false)

  console.log("collaborators", collaborators)
  // Fetch data when modal opens OR structure changes (but preserve existing data)
  useEffect(() => {
    if (isOpen && structureId) {
      dispatch(fetchSharesForStructure(structureId))
      dispatch(fetchCollaborators(structureId))
      dispatch(fetchPendingInvitations(structureId))
      dispatch(fetchShareableLinks(structureId))
    }
  }, [isOpen, structureId, dispatch])

  // Clear state when modal closes to ensure fresh data on reopen
  useEffect(() => {
    if (!isOpen) {
      // Reset local state but preserve Redux data
      setSelectedEmails([])
      setCustomMessage("")
      setEmail("")
      setActiveTab("invite")
    }
  }, [isOpen])

  // Manual refresh function
  const handleRefresh = useCallback(async () => {
    if (!structureId || refreshing) return

    setRefreshing(true)
    try {
      await Promise.all([
        dispatch(fetchPendingInvitations(structureId)),
        dispatch(fetchCollaborators(structureId)),
      ])
      cogoToast.success("Data refreshed!")
    } catch (error) {
      cogoToast.error("Failed to refresh data")
    } finally {
      setRefreshing(false)
    }
  }, [structureId, dispatch, refreshing])

  const checkDuplicateEmail = useCallback(
    emailToCheck => {
      const trimmedEmail = emailToCheck.trim().toLowerCase()

      // Find the owner email from collaborators (inviter.email)
      const ownerInviter = displayCollaborators?.find(c => c.inviter)?.inviter
      const ownerEmail =
        ownerInviter?.email?.toLowerCase() || user?.email?.toLowerCase()
      // Check if trying to invite the owner (self-invitation)
      if (ownerEmail && ownerEmail === trimmedEmail) {
        return {
          isDuplicate: true,
          type: "owner",
          message: `🚫 You  cannot invite the structure owner! The owner already has full access.`,
        }
      }

      // Check if already a collaborator
      const existingCollaborator = displayCollaborators?.find(c => {
        const collaboratorEmail =
          c?.inviteeEmail?.toLowerCase() ||
          c?.user?.email?.toLowerCase() ||
          c?.email?.toLowerCase()
        return collaboratorEmail && collaboratorEmail === trimmedEmail
      })
      if (existingCollaborator) {
        return {
          isDuplicate: true,
          type: "collaborator",
          message: `👥 "${trimmedEmail}" is already a collaborator with access to this structure.`,
        }
      }

      // Check if already in shares list (accepted invitations)
      const existingShare = shares?.find(share => {
        const shareEmail =
          share?.user?.email?.toLowerCase() || share?.email?.toLowerCase()
        return shareEmail && shareEmail === trimmedEmail
      })
      if (existingShare) {
        return {
          isDuplicate: true,
          type: "share",
          message: `✅ "${trimmedEmail}" already has access to this structure.`,
        }
      }

      // Check if has pending invitation
      const pendingInvitation = pendingInvitations?.find(
        inv => inv.inviteeEmail?.toLowerCase() === trimmedEmail
      )
      if (pendingInvitation) {
        return {
          isDuplicate: true,
          type: "pending",
          message: `⏳ Invitation already sent to "${trimmedEmail}". Check the Pending tab to manage existing invitations.`,
        }
      }

      // Check if already selected in current session
      const isSelected = selectedEmails?.includes(trimmedEmail)
      if (isSelected) {
        return {
          isDuplicate: true,
          type: "selected",
          message: `📝 "${trimmedEmail}" is already in your invitation list below.`,
        }
      }

      return { isDuplicate: false }
    },
    [user, displayCollaborators, shares, selectedEmails, pendingInvitations]
  )

  const handleAddEmail = e => {
    if (e?.key === "Enter" && isValidEmail(email)) {
      const duplicateCheck = checkDuplicateEmail(email)

      if (duplicateCheck.isDuplicate) {
        cogoToast.warn(duplicateCheck.message)
        setEmail("")
        return
      }

      setSelectedEmails(prev => [...prev, email.trim().toLowerCase()])
      setEmail("")
    }
  }

  const handleCancelInvitation = async invitationId => {
    try {
      // Use removeCollaborator for pending invitations (StructureShareInvitation table)
      await dispatch(removeCollaborator(invitationId)).unwrap()
      cogoToast.success("Invitation cancelled successfully!")
      // Refresh pending invitations list
      dispatch(fetchPendingInvitations(structureId))
    } catch (error) {
      cogoToast.error(error?.message || "Failed to cancel invitation")
    }
  }
  console.log("user", user)

  const handleRemoveEmail = emailToRemove => {
    setSelectedEmails(prev =>
      prev.filter(selectedEmail => selectedEmail !== emailToRemove)
    )
  }

  const handleSendInvites = async () => {
    if (selectedEmails.length === 0) {
      cogoToast.warn("Please add at least one email address.")
      return
    }

    // Final validation before sending - check for real duplicates only
    const invalidEmails = []
    const validationDetails = []

    selectedEmails.forEach(email => {
      const duplicateCheck = checkDuplicateEmail(email)
      validationDetails.push({ email, check: duplicateCheck })

      // Only block if it's a real duplicate that shouldn't be sent
      if (
        duplicateCheck.isDuplicate &&
        (duplicateCheck.type === "owner" ||
          duplicateCheck.type === "collaborator" ||
          duplicateCheck.type === "share" ||
          duplicateCheck.type === "pending")
      ) {
        invalidEmails.push(email)
      }
    })

    if (invalidEmails.length > 0) {
      const invalidDetails = validationDetails
        .filter(detail => invalidEmails.includes(detail.email))
        .map(detail => `${detail.email} (${detail.check.type})`)
        .join(", ")

      cogoToast.error(
        `Cannot send invitations to: ${invalidDetails}. Please remove these emails first.`
      )
      return
    }

    try {
      for (const email of selectedEmails) {
        await dispatch(
          inviteUserToShare({
            structureId,
            inviteeEmail: email,
            permission: selectedPermission,
            message: customMessage?.trim() || undefined,
          })
        ).unwrap()
      }

      cogoToast.success("Invitations sent successfully!")
      setSelectedEmails([])
      setCustomMessage("")
      setActiveTab("pending")

      // Refresh all data to show updates
      dispatch(fetchPendingInvitations(structureId))
      dispatch(fetchCollaborators(structureId))
    } catch (error) {
      cogoToast.error(error?.message || "Failed to send invitations")
    }
  }

  const handlePermissionChange = async (shareId, newPermission) => {
    try {
      await dispatch(
        updateShareRole({
          id: shareId,
          dto: { permission: newPermission },
        })
      ).unwrap()
      cogoToast.success("Permission updated successfully!")
    } catch (error) {
      cogoToast.error(error.message || "Failed to update permission")
    }
  }

  const handleRemoveCollaborator = async invitationId => {
    try {
      await dispatch(removeCollaborator(invitationId)).unwrap()
      cogoToast.success("Invitation removed successfully!")
      dispatch(fetchCollaborators(structureId))
    } catch (error) {
      cogoToast.error(error.message || "Failed to remove invitation")
    }
  }

  const handleCreateLink = async () => {
    try {
      const linkData = await dispatch(
        createShareLink({
          structureId,
          permission: linkPermission,
          expiresIn: "30d",
        })
      ).unwrap()

      const fullLink = `${window.location.origin}/shared/${linkData.token}`
      await navigator.clipboard.writeText(fullLink)
      cogoToast.success("Share link created and copied to clipboard!")

      // Refresh share links to show the new link
      dispatch(fetchShareableLinks(structureId))
    } catch (error) {
      cogoToast.error(error?.message || "Failed to create share link")
    }
  }

  const handleCopyLink = async link => {
    try {
      await navigator.clipboard.writeText(link)
      cogoToast.success("Link copied to clipboard!")
    } catch (error) {
      cogoToast.error("Failed to copy link")
    }
  }

  const handleRevokeLink = async linkId => {
    try {
      await dispatch(revokeShareLink(linkId)).unwrap()
      cogoToast.success("Share link revoked successfully!")

      // Refresh share links to remove the revoked link
      dispatch(fetchShareableLinks(structureId))
    } catch (error) {
      cogoToast.error(error?.message || "Failed to revoke share link")
    }
  }

  if (!isOpen) return null
  const owner =
    shares?.find(s => s?.permission === PERMISSION_LEVELS.OWNER)?.user ||
    displayCollaborators?.find(c => c?.inviter)?.inviter ||
    user ||
    null

  // used to compute count without double-counting if owner already present in collaborators
  const ownerIncludedInCollaborators = !!displayCollaborators?.some(
    c => c?.inviter?.email?.toLowerCase() === owner?.email?.toLowerCase()
  )
  const collaboratorCount =
    (displayCollaborators?.length || 0) +
    (owner && !ownerIncludedInCollaborators ? 1 : 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-11/12 max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center border-b p-6">
          <h2 className="text-xl font-bold">Share Structure</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ✖
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "invite", label: "Invite People" },
              { id: "collaborators", label: "Collaborators" },
              {
                id: "pending",
                label: `Pending (${pendingInvitations?.length || 0})`,
              },
              { id: "links", label: "Share Links" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-custom-main text-custom-main"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Invite Tab */}
          {activeTab === "invite" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Invite by email
                </label>
                <div className="flex items-center mt-2 space-x-2">
                  <input
                    type="text"
                    placeholder="Add people by email and press Enter"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={handleAddEmail}
                    className="flex-grow border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-custom-main"
                  />
                  <select
                    value={selectedPermission}
                    onChange={e => setSelectedPermission(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-custom-main"
                  >
                    <option value={PERMISSION_LEVELS.EDITOR}>
                      {PERMISSION_CONFIG[PERMISSION_LEVELS.EDITOR].label}
                    </option>
                    <option value={PERMISSION_LEVELS.COMMENTER}>
                      {PERMISSION_CONFIG[PERMISSION_LEVELS.COMMENTER].label}
                    </option>
                    <option value={PERMISSION_LEVELS.VIEWER}>
                      {PERMISSION_CONFIG[PERMISSION_LEVELS.VIEWER].label}
                    </option>
                  </select>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Press <b>Enter</b> to add an email.
                </p>
              </div>

              {/* Selected Emails */}
              {selectedEmails.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    People to invite:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmails.map((email, index) => (
                      <div
                        key={`selected-email-${index}-${email}`}
                        className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                      >
                        <span>{email}</span>
                        <button
                          onClick={() => handleRemoveEmail(email)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ✖
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Add a custom message (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Add an optional message for invitees..."
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-custom-main"
                ></textarea>
              </div>

              {/* Permission Info */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-900 mb-2">
                  Permission Levels:
                </h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(PERMISSION_CONFIG)
                    .filter(([key]) => key !== PERMISSION_LEVELS.OWNER)
                    .map(([key, config]) => {
                      const Icon = config.icon
                      return (
                        <div key={key} className="flex items-center space-x-2">
                          <Icon className={`w-4 h-4 ${config.color}`} />
                          <span className="font-medium">{config.label}:</span>
                          <span className="text-gray-600">
                            {config.description}
                          </span>
                        </div>
                      )
                    })}
                </div>
              </div>

              {/* Send Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSendInvites}
                  disabled={selectedEmails.length === 0 || loading?.mutations}
                  className={`px-4 py-2 rounded-md font-medium ${
                    selectedEmails.length > 0 && !loading?.mutations
                      ? "bg-custom-main text-white hover:bg-custom-secondary"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {loading?.mutations ? "Sending..." : "Send Invitations"}
                </button>
              </div>
            </div>
          )}

          {/* Collaborators Tab */}
          {activeTab === "collaborators" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Current Collaborators</h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                    title="Refresh collaborators"
                  >
                    <FiRefreshCw
                      className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                    />
                    <span>Refresh</span>
                  </button>
                  <span className="text-sm text-gray-500">
                    {collaboratorCount} collaborator(s)
                  </span>
                </div>
              </div>

              {/* Always show content since owner should always be displayed */}
              <div className="space-y-3">
                {/* Show Owner First - Always display */}
                {owner && (
                  <div className="flex items-center justify-between p-4 border-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <FiUser className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-blue-900">
                            {owner?.displayName || owner?.email || "You"}
                          </p>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                            OWNER
                          </span>
                        </div>
                        <p className="text-sm text-blue-700">{owner?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        <FiSettings className="w-4 h-4 mr-1" />
                        Full Access
                      </span>
                    </div>
                  </div>
                )}

                {/* Show message if no other collaborators */}
                {(!displayCollaborators ||
                  displayCollaborators.length === 0) && (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    <FiUser className="mx-auto w-12 h-12 mb-4 text-gray-400" />
                    <p className="font-medium mb-2">
                      No collaborators invited yet
                    </p>
                    <p className="text-sm mb-4">
                      Start collaborating by inviting team members!
                    </p>
                    <button
                      onClick={() => setActiveTab("invite")}
                      className="px-4 py-2 bg-custom-main text-white rounded-md hover:bg-custom-secondary transition-colors"
                    >
                      Invite People
                    </button>
                  </div>
                )}

                {/* Show Other Collaborators */}
                {displayCollaborators &&
                  displayCollaborators.length > 0 &&
                  displayCollaborators
                    ?.filter(
                      (collaborator, index, array) =>
                        array.findIndex(c => c.id === collaborator.id) === index
                    )
                    ?.map((collaborator, index) => {
                      const config = PERMISSION_CONFIG[collaborator.permission]
                      const Icon = config.icon
                      return (
                        <div
                          key={`collaborator-${collaborator.id}-${index}`}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <FiUser className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {collaborator?.inviteeEmail}
                              </p>
                              <p className="text-sm text-gray-500">
                                {collaborator?.inviteeEmail}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {collaborator?.permission ===
                            PERMISSION_LEVELS.OWNER ? (
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}
                              >
                                <Icon className="w-4 h-4 mr-1" />
                                owner
                              </span>
                            ) : (
                              <>
                                <select
                                  value={collaborator?.permission}
                                  onChange={e =>
                                    handlePermissionChange(
                                      collaborator.id,
                                      e.target.value
                                    )
                                  }
                                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:border-custom-main"
                                >
                                  <option value={PERMISSION_LEVELS.EDITOR}>
                                    {
                                      PERMISSION_CONFIG[
                                        PERMISSION_LEVELS.EDITOR
                                      ].label
                                    }
                                  </option>
                                  <option value={PERMISSION_LEVELS.COMMENTER}>
                                    {
                                      PERMISSION_CONFIG[
                                        PERMISSION_LEVELS.COMMENTER
                                      ].label
                                    }
                                  </option>
                                  <option value={PERMISSION_LEVELS.VIEWER}>
                                    {
                                      PERMISSION_CONFIG[
                                        PERMISSION_LEVELS.VIEWER
                                      ].label
                                    }
                                  </option>
                                </select>
                                <button
                                  onClick={() => {
                                    handleRemoveCollaborator(collaborator?.id)
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                  title="Remove collaborator"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
              </div>
            </div>
          )}

          {/* Pending Invitations Tab */}
          {activeTab === "pending" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Pending Invitations</h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                    title="Refresh pending invitations"
                  >
                    <FiRefreshCw
                      className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                    />
                    <span>Refresh</span>
                  </button>
                  <span className="text-sm text-gray-500">
                    {pendingInvitations?.length} pending invitation(s)
                  </span>
                </div>
              </div>

              {pendingInvitations?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FiClock className="mx-auto w-12 h-12 mb-4" />
                  <p>No pending invitations.</p>
                  <button
                    onClick={() => setActiveTab("invite")}
                    className="mt-2 text-custom-main hover:text-custom-secondary"
                  >
                    Send New Invitations
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingInvitations
                    ?.filter(
                      (invitation, index, array) =>
                        array.findIndex(
                          inv =>
                            inv.id === invitation.id &&
                            inv.inviteeEmail === invitation.inviteeEmail
                        ) === index
                    )
                    ?.map((invitation, index) => {
                      const config = PERMISSION_CONFIG[invitation.permission]
                      const Icon = config.icon
                      const isExpiringSoon =
                        new Date(invitation.expiresAt) - new Date() <
                        24 * 60 * 60 * 1000 // Less than 24 hours

                      return (
                        <div
                          key={`pending-invitation-${invitation.id || index}-${
                            invitation.inviteeEmail
                          }-${index}`}
                          className={`flex items-center justify-between p-4 border rounded-lg ${
                            isExpiringSoon
                              ? "border-yellow-300 bg-yellow-50"
                              : ""
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <FiClock className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {invitation.inviteeEmail}
                              </p>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <span>
                                  Invited{" "}
                                  {new Date(
                                    invitation.createdAt
                                  ).toLocaleDateString()}
                                </span>
                                {isExpiringSoon && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    <FiAlertCircle className="w-3 h-3 mr-1" />
                                    Expires soon
                                  </span>
                                )}
                              </div>
                              {invitation.message && (
                                <p className="text-sm text-gray-600 mt-1 italic">
                                  "{invitation.message}"
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}
                            >
                              <Icon className="w-4 h-4 mr-1" />
                              {config.label}
                            </span>

                            <button
                              onClick={() =>
                                handleCancelInvitation(invitation.id)
                              }
                              className="text-red-500 hover:text-red-700"
                              title="Cancel invitation"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}

              {/* Auto-refresh indicator */}
              <div className="flex items-center justify-center text-xs text-gray-400 mt-4">
                <FiRefreshCw className="w-3 h-3 mr-1 animate-spin" />
                Refresh to see latest updates...
              </div>

              {/* Info box about pending invitations */}
              {pendingInvitations?.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <FiAlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">
                        About pending invitations:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-blue-700">
                        <li>Invitations expire after 7 days</li>
                        <li>
                          Users need to create an account to accept invitations
                        </li>
                        <li>Cancelled invitations cannot be recovered</li>
                        <li className="text-green-700 font-medium">
                          ✨ This list updates automatically when users accept
                          invitations
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Share Links Tab */}
          {activeTab === "links" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Shareable Links</h3>
                <button
                  onClick={handleCreateLink}
                  className="px-4 py-2 bg-custom-main text-white rounded-md hover:bg-custom-secondary"
                >
                  Create Link
                </button>
              </div>

              {/* Link Creation Form */}
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center space-x-3">
                  <label className="text-sm font-medium text-gray-700">
                    Permission:
                  </label>
                  <select
                    value={linkPermission}
                    onChange={e => setLinkPermission(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:border-custom-main"
                  >
                    <option value={PERMISSION_LEVELS.VIEWER}>
                      {PERMISSION_CONFIG[PERMISSION_LEVELS.VIEWER].label}
                    </option>
                    <option value={PERMISSION_LEVELS.COMMENTER}>
                      {PERMISSION_CONFIG[PERMISSION_LEVELS.COMMENTER].label}
                    </option>
                    <option value={PERMISSION_LEVELS.EDITOR}>
                      {PERMISSION_CONFIG[PERMISSION_LEVELS.EDITOR].label}
                    </option>
                  </select>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Anyone with this link will have{" "}
                  <span className="font-medium">
                    {PERMISSION_CONFIG[linkPermission].label.toLowerCase()}
                  </span>{" "}
                  access to your structure.
                </p>
              </div>

              {/* Existing Links */}
              {displayShareLinks?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FiCopy className="mx-auto w-12 h-12 mb-4" />
                  <p>No shareable links created yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayShareLinks
                    ?.filter(
                      (link, index, array) =>
                        array.findIndex(
                          l =>
                            l.id === link.id ||
                            (l.token === link.token && l.id === link.id)
                        ) === index
                    )
                    .map((link, index) => {
                      const config = PERMISSION_CONFIG[link.permission]
                      const Icon = config.icon
                      const fullLink = `${window.location.origin}/shared/${link.token}`
                      const createdAt = link.createdAt
                        ? new Date(link.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Unknown"

                      return (
                        <div
                          key={`share-link-${link.id || index}-${
                            link.token
                          }-${index}`}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center space-x-3 flex-grow">
                            <Icon className={`w-5 h-5 ${config.color}`} />
                            <div className="flex-grow">
                              <div className="flex items-center space-x-2 mb-2">
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}
                                >
                                  {config.label}
                                </span>
                                <span className="text-sm text-gray-500">
                                  Created: {createdAt}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 font-mono truncate bg-gray-50 p-2 rounded">
                                {fullLink}
                              </p>
                              {link.expiresAt && (
                                <p className="text-xs text-gray-400 mt-1">
                                  Expires:{" "}
                                  {new Date(link.expiresAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleCopyLink(fullLink)}
                              className="text-gray-500 hover:text-gray-700"
                              title="Copy link"
                            >
                              <FiCopy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRevokeLink(link.id)}
                              className="text-red-500 hover:text-red-700"
                              title="Revoke link"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ShareModal
