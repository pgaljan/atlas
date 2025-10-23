import cogoToast from '@successtar/cogo-toast';
import { useEffect, useState, useCallback } from 'react';
import { FiAlertCircle, FiClock, FiRefreshCw } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSharesForStructure,
  fetchCollaborators,
  fetchPendingInvitations,
  inviteUserToShare,
  removeCollaborator,
  removeShare,
  removeCollaboratorByUser,
  updateShareRole,
} from '../../redux/slices/structure-sharing';
import { PERMISSION_LEVELS, PERMISSION_CONFIG } from '../../types/permissions';
import { fetchAllUsers } from '../../redux/slices/users';

const isValidUsername = (u) => /^[a-zA-Z0-9._-]{3,30}$/.test(u?.trim());

const ShareModal = ({ isOpen, onClose, structureId }) => {
  const user = useSelector((state) => state.auth?.user || null);
  const dispatch = useDispatch();

  const [username, setUsername] = useState('');
  const [selectedUsernames, setSelectedUsernames] = useState([]);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedPermission, setSelectedPermission] = useState(PERMISSION_LEVELS.EDITOR);
  const [activeTab, setActiveTab] = useState('invite');
  const [refreshing, setRefreshing] = useState(false);

  const {
    collaborators = [],
    pendingInvitations = [],
    shares = [],
    loading,
  } = useSelector((state) => state.structureShares || {});
  const allUsersFromStore = useSelector(
    (state) => state.user?.users || state.user?.usersList || state.user?.all || [],
  );
  const displayCollaborators = Array.isArray(collaborators) ? collaborators : [];

  const isRegisteredUsername = useCallback(
    (u) => {
      if (!Array.isArray(allUsersFromStore) || allUsersFromStore.length === 0) return null;
      const trimmed = (u || '').trim().toLowerCase();
      return allUsersFromStore.some((usr) => {
        if (!usr) return false;
        if (typeof usr === 'string') return usr.toLowerCase() === trimmed;
        const cand = (usr?.username || usr?.userName || (usr.user && usr.user.username) || '')
          .toString()
          .toLowerCase();
        return cand === trimmed;
      });
    },
    [allUsersFromStore],
  );

  useEffect(() => {
    if (isOpen && structureId) {
      dispatch(fetchAllUsers());
      dispatch(fetchSharesForStructure(structureId));
      dispatch(fetchCollaborators(structureId));
      dispatch(fetchPendingInvitations(structureId));
    }
  }, [isOpen, structureId, dispatch]);

  // Reset modal state when closed
  useEffect(() => {
    if (!isOpen) {
      setSelectedUsernames([]);
      setCustomMessage('');
      setUsername('');
      setActiveTab('invite');
    }
  }, [isOpen]);

  const handleRefresh = useCallback(
    async (showToast = true) => {
      if (!structureId || refreshing) return;
      setRefreshing(true);
      try {
        await Promise.all([
          dispatch(fetchPendingInvitations(structureId)),
          dispatch(fetchCollaborators(structureId)),
          dispatch(fetchSharesForStructure(structureId)),
        ]);
        if (showToast) cogoToast.success('Data refreshed!');
      } catch (error) {
        cogoToast.error('Failed to refresh data');
      } finally {
        setRefreshing(false);
      }
    },
    [structureId, dispatch, refreshing],
  );

  // Determine owner
  const owner =
    shares?.find((s) => s?.permission === PERMISSION_LEVELS.OWNER)?.user ||
    displayCollaborators?.find((c) => c?.inviter)?.inviter ||
    user ||
    null;
  const ownerUsername = owner?.username?.trim().toLowerCase() || null;

  // Check for duplicates before adding a username
  const checkDuplicateUsername = useCallback(
    (uToCheck) => {
      const trimmed = uToCheck.trim().toLowerCase();

      if (ownerUsername && ownerUsername === trimmed) {
        return {
          isDuplicate: true,
          type: 'owner',
          message: `🚫 You (${ownerUsername}) cannot invite the owner.`,
        };
      }

      const existingCollaborator = displayCollaborators?.find((c) => {
        const collaboratorName = (c?.inviteeUsername || c?.user?.username || '').toLowerCase();
        return collaboratorName === trimmed;
      });
      if (existingCollaborator) {
        return {
          isDuplicate: true,
          type: 'collaborator',
          message: `👥 "${trimmed}" is already a collaborator.`,
        };
      }

      const existingShare = shares?.find((share) => {
        const shareName = (share?.user?.username || '').toLowerCase();
        return shareName === trimmed;
      });
      if (existingShare) {
        return {
          isDuplicate: true,
          type: 'share',
          message: `✅ "${trimmed}" already has access.`,
        };
      }

      const pending = pendingInvitations?.find(
        (inv) => (inv.inviteeUsername || '').toLowerCase() === trimmed,
      );
      if (pending) {
        return {
          isDuplicate: true,
          type: 'pending',
          message: `⏳ Invitation already sent to "${trimmed}".`,
        };
      }

      const isSelected = selectedUsernames?.includes(trimmed);
      if (isSelected) {
        return {
          isDuplicate: true,
          type: 'selected',
          message: `📝 "${trimmed}" is already in your invite list.`,
        };
      }

      return { isDuplicate: false };
    },
    [ownerUsername, displayCollaborators, shares, selectedUsernames, pendingInvitations],
  );

  const handleAddUsername = (e) => {
    if (e?.key !== 'Enter') return;

    const raw = username?.trim();
    if (!isValidUsername(raw)) {
      cogoToast.warn('Invalid username. Use 3–30 chars: letters, numbers, . _ -');
      return;
    }

    const trimmed = raw.toLowerCase();

    const duplicateCheck = checkDuplicateUsername(trimmed);
    if (duplicateCheck.isDuplicate) {
      cogoToast.warn(duplicateCheck.message);
      setUsername('');
      return;
    }

    const registered = isRegisteredUsername(trimmed);

    if (registered === false) {
      cogoToast.error('Invitee must be a registered user');
      setUsername('');
      return;
    }

    if (registered === null) {
      console.warn(
        'No global users list found in Redux (state.users.list or similar). Cannot validate registration on Enter — falling back to default behavior.',
      );
    }

    setSelectedUsernames((prev) => [...prev, trimmed]);
    setUsername('');
  };

  const handleCancelInvitation = async (invitationId) => {
    try {
      await dispatch(removeCollaborator(invitationId)).unwrap();
      cogoToast.success('Invitation cancelled successfully!');
      (dispatch(fetchPendingInvitations(structureId)),
        dispatch(fetchCollaborators(structureId)),
        dispatch(fetchSharesForStructure(structureId)));
    } catch (error) {
      cogoToast.error(error?.message || 'Failed to cancel invitation');
    }
  };

  const handleRemoveAcceptedCollaborator = async (shareId) => {
    try {
      await dispatch(removeShare(shareId)).unwrap();
      cogoToast.success('Collaborator removed successfully!');
      (dispatch(fetchPendingInvitations(structureId)),
        dispatch(fetchCollaborators(structureId)),
        dispatch(fetchSharesForStructure(structureId)));
    } catch (error) {
      cogoToast.error(error?.message || 'Failed to remove collaborator');
    }
  };

  const handleRemoveCollaboratorByUser = async (userId) => {
    try {
      await dispatch(removeCollaboratorByUser({ structureId, userId })).unwrap();
      cogoToast.success('Collaborator removed successfully!');
      (dispatch(fetchPendingInvitations(structureId)),
        dispatch(fetchCollaborators(structureId)),
        dispatch(fetchSharesForStructure(structureId)));
    } catch (error) {
      cogoToast.error(error?.message || 'Failed to remove collaborator');
    }
  };

  const handleRemoveRow = async (row) => {
    if (row?.user && row?.id) {
      await handleRemoveAcceptedCollaborator(row.id);
      return;
    }

    if (row?.inviteeId) {
      await handleRemoveCollaboratorByUser(row.inviteeId);
      return;
    }

    if (row?.userId) {
      await handleRemoveCollaboratorByUser(row.userId);
      return;
    }

    if (row?.id) {
      await handleCancelInvitation(row.id);
      return;
    }

    cogoToast.error(
      'Unable to determine collaborator type to remove. Provide shareId, inviteeId, or invitation id.',
    );
  };

  const handleRemoveUsername = (u) => {
    setSelectedUsernames((prev) => prev.filter((s) => s !== u));
  };

  const handleSendInvites = async () => {
    if (selectedUsernames.length === 0) {
      cogoToast.warn('Please add at least one username.');
      return;
    }

    const invalid = [];
    const validationDetails = [];

    selectedUsernames.forEach((u) => {
      const check = checkDuplicateUsername(u);
      validationDetails.push({ username: u, check });
      if (check.isDuplicate && ['owner', 'collaborator', 'share', 'pending'].includes(check.type)) {
        invalid.push(u);
      }
    });

    if (invalid.length > 0) {
      const invalidDetails = validationDetails
        .filter((d) => invalid.includes(d.username))
        .map((d) => `${d.username} (${d.check.type})`)
        .join(', ');
      cogoToast.error(`Cannot send invitations to: ${invalidDetails}. Remove them first.`);
      return;
    }

    try {
      for (const u of selectedUsernames) {
        await dispatch(
          inviteUserToShare({
            structureId,
            inviteeUsername: u,
            permission: selectedPermission,
            message: customMessage?.trim() || undefined,
          }),
        ).unwrap();
      }

      cogoToast.success('Invitations sent successfully!');
      setSelectedUsernames([]);
      setCustomMessage('');
      setActiveTab('pending');

      (dispatch(fetchPendingInvitations(structureId)),
        dispatch(fetchCollaborators(structureId)),
        dispatch(fetchSharesForStructure(structureId)));
    } catch (error) {
      cogoToast.error(error?.message || 'Failed to send invitations');
    }
  };

  const handlePermissionChange = async (shareOrInvitationId, newPermission) => {
    try {
      await dispatch(
        updateShareRole({
          id: shareOrInvitationId,
          dto: { permission: newPermission },
        }),
      ).unwrap();
      cogoToast.success('Permission updated successfully!');
      dispatch(fetchCollaborators(structureId));
      dispatch(fetchSharesForStructure(structureId));
    } catch (error) {
      cogoToast.error(error.message || 'Failed to update permission');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-11/12 max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center border-b p-6">
          <h2 className="text-xl font-bold">Share Structure</h2>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            ✖
          </button>
        </div>

        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'invite', label: 'Invite People' },
              { id: 'collaborators', label: 'Collaborators' },
              { id: 'pending', label: `Pending (${pendingInvitations?.length || 0})` },
            ]?.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-custom-main text-custom-main'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'invite' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Invite by username
                </label>
                <div className="flex items-center mt-2 space-x-2">
                  <input
                    type="text"
                    placeholder="Add people by username and press Enter (e.g. jdoe or john_doe25)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={handleAddUsername}
                    className="flex-grow border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-custom-main"
                  />
                  <select
                    value={selectedPermission}
                    onChange={(e) => setSelectedPermission(e.target.value)}
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
                  Press <b>Enter</b> to add a username.
                </p>
              </div>

              {selectedUsernames.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    People to invite:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsernames.map((u, index) => (
                      <div
                        key={`selected-username-${index}-${u}`}
                        className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                      >
                        <span>{u}</span>
                        <button
                          onClick={() => handleRemoveUsername(u)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ✖
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Add a custom message (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Add an optional message for invitees..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-custom-main"
                ></textarea>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-900 mb-2">Permission Levels:</h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(PERMISSION_CONFIG)
                    .filter(([key]) => key !== PERMISSION_LEVELS.OWNER)
                    .map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <div key={key} className="flex items-center space-x-2">
                          <Icon className={`w-4 h-4 ${config.color}`} />
                          <span className="font-medium">{config.label}:</span>
                          <span className="text-gray-600">{config.description}</span>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSendInvites}
                  disabled={selectedUsernames.length === 0 || loading?.mutations}
                  className={`px-4 py-2 rounded-md font-medium ${
                    selectedUsernames.length > 0 && !loading?.mutations
                      ? 'bg-custom-main text-white hover:bg-custom-secondary'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {loading?.mutations ? 'Sending...' : 'Send Invitations'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'collaborators' && (
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
                    <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                  <span className="text-sm text-gray-500">
                    {displayCollaborators?.length || 0} collaborator(s)
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {displayCollaborators &&
                  displayCollaborators.length > 0 &&
                  displayCollaborators
                    ?.filter(
                      (collaborator, index, array) =>
                        array.findIndex((c) => c.id === collaborator.id) === index,
                    )
                    ?.map((collaborator, index) => {
                      const isShareRow = !!collaborator?.user;
                      const usernameDisplay =
                        collaborator?.inviteeUsername ||
                        collaborator?.user?.username ||
                        collaborator?.username ||
                        'Unknown';
                      const permission = collaborator?.permission || PERMISSION_LEVELS.VIEWER;
                      const config =
                        PERMISSION_CONFIG[permission] ||
                        PERMISSION_CONFIG[PERMISSION_LEVELS.VIEWER];
                      const Icon = config.icon;

                      return (
                        <div
                          key={`collaborator-${collaborator.id || index}-${usernameDisplay}`}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <Icon className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium truncate">{usernameDisplay}</p>
                              <p className="text-sm text-gray-500">
                                {isShareRow ? 'Has access' : 'Invitation'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            {collaborator?.permission === PERMISSION_LEVELS.OWNER ? (
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}
                              >
                                <Icon className="w-4 h-4 mr-1" />
                                owner
                              </span>
                            ) : (
                              <>
                                <select
                                  value={permission}
                                  onChange={(e) =>
                                    handlePermissionChange(collaborator.id, e.target.value)
                                  }
                                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:border-custom-main"
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

                                <button
                                  onClick={() => handleRemoveRow(collaborator)}
                                  className="text-red-500 hover:text-red-700"
                                  title={
                                    isShareRow
                                      ? 'Remove collaborator'
                                      : 'Cancel invitation / Remove'
                                  }
                                >
                                  <FiAlertCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
              </div>
            </div>
          )}

          {activeTab === 'pending' && (
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
                    <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                  <span className="text-sm text-gray-500">
                    {pendingInvitations?.length || 0} pending invitation(s)
                  </span>
                </div>
              </div>

              {pendingInvitations?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FiClock className="mx-auto w-12 h-12 mb-4" />
                  <p>No pending invitations.</p>
                  <button
                    onClick={() => setActiveTab('invite')}
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
                          (inv) =>
                            inv.id === invitation.id &&
                            inv.inviteeUsername === invitation.inviteeUsername,
                        ) === index,
                    )
                    ?.map((invitation, index) => {
                      const config =
                        PERMISSION_CONFIG[invitation.permission] ||
                        PERMISSION_CONFIG[PERMISSION_LEVELS.VIEWER];
                      const Icon = config.icon;
                      const isExpiringSoon =
                        new Date(invitation.expiresAt) - new Date() < 24 * 60 * 60 * 1000;

                      return (
                        <div
                          key={`pending-invitation-${invitation.id || index}-${invitation.inviteeUsername}-${index}`}
                          className={`flex items-start justify-between p-4 border rounded-lg ${isExpiringSoon ? 'border-yellow-300 bg-yellow-50' : ''}`}
                        >
                          <div className="flex items-start space-x-3 min-w-0">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                              <FiClock className="w-5 h-5 text-gray-600" />
                            </div>

                            <div className="min-w-0">
                              <p className="font-medium truncate">{invitation.inviteeUsername}</p>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <span>
                                  Invited {new Date(invitation.createdAt).toLocaleDateString()}
                                </span>
                                {isExpiringSoon && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    <FiAlertCircle className="w-3 h-3 mr-1" />
                                    Expires soon
                                  </span>
                                )}
                              </div>

                              {invitation.message && (
                                <p className="text-sm text-gray-600 mt-1 italic break-words max-w-[60ch]">
                                  "{invitation.message}"
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 flex-shrink-0 ml-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color} whitespace-nowrap`}
                            >
                              <Icon className="w-4 h-4 mr-1" />
                              {config.label}
                            </span>

                            <button
                              onClick={() => handleCancelInvitation(invitation.id)}
                              className="text-red-500 hover:text-red-700"
                              title="Cancel invitation"
                            >
                              ✖
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              <div className="flex items-center justify-center text-xs text-gray-400 mt-4">
                <FiRefreshCw className="w-3 h-3 mr-1 animate-spin" />
                Refresh to see latest updates...
              </div>

              {pendingInvitations?.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <FiAlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">About pending invitations:</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-700">
                        <li>Invitations expire after 7 days</li>
                        <li>Users need to create an account to accept invitations</li>
                        <li>Cancelled invitations cannot be recovered</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
