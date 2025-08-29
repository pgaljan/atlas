import cogoToast from '@successtar/cogo-toast';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import GenericTable from '../../../components/generic-table/GenericTable';
import DeleteModal from '../../../components/modals/DeleteModal';
import InviteModal from '../../../components/modals/InviteModal';
import { invitationConfig } from '../../../constants/index';
import { deleteInvitation, listInvitations } from '../../../redux/slices/invitations';

const Invitation = ({ onSubmit }) => {
  const dispatch = useDispatch();
  const workspaceId = Cookies.get('workspaceId');

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!workspaceId) {
          console.error('Workspace ID is not available.');
          return;
        }

        setIsLoading(true);
        const result = await dispatch(listInvitations(workspaceId)).unwrap();
        //  console.log("result", result);
        const formattedData = result.map((invitation) => ({
          id: invitation.id,
          token: invitation.token,
          inviteCode: invitation.referralCode || '--',
          email: invitation.inviteeEmail,
          status: invitation.status,
          generated: new Date(invitation.createdAt).toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          accepted: invitation.usedAt
            ? new Date(invitation.usedAt).toLocaleString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })
            : '--',
          expire: new Date(invitation.expiresAt).toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
        }));

        setInvitations(formattedData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dispatch, workspaceId]);

  const handleDelete = (member) => {
    if (member.status === 'ACCEPTED') {
      return cogoToast.warn('Accepted invitations cannot be deleted.');
    }
    setSelectedMember(member);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedMember) return;
    setDeleting(true);
    try {
      setIsLoading(true);

      await dispatch(
        deleteInvitation({
          invitationId: selectedMember.id,
          workspaceId,
        }),
      ).unwrap();

      cogoToast.success('Invitation deleted successfully!');

      setInvitations((prevMembers) =>
        prevMembers.filter((member) => member.id !== selectedMember.id),
      );
    } catch (err) {
      cogoToast.error(err?.message || 'Failed to delete invitation.');
    } finally {
      setDeleting(false);
      setIsLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  const filteredMembers = invitations.filter((member) =>
    member.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const tokenCounts = {
    total: invitations.length,
    pending: invitations.filter((m) => m.status === 'pending').length,
    accepted: invitations.filter((m) => m.status === 'accepted').length,
  };

  const handleExportTokens = () => {
    if (filteredMembers.length === 0) {
      return cogoToast.warn('No invitations to export.');
    }

    const csvContent = [
      ['Email', 'Token', 'Invite Code', 'Status', 'Generated At', 'Accepted At', 'Expires At'],
      ...filteredMembers.map((m) => [
        m.email,
        m.token,
        m.inviteCode || '--',
        m.status,
        m.generated,
        m.accepted,
        m.expire,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invitations.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateToken = () => {
    setIsInviteModalOpen(true);
  };

  const updatedInvitationConfig = {
    ...invitationConfig,
    actions: invitationConfig.actions.map((action) => {
      if (action.tooltip === 'Delete') {
        return {
          ...action,
          onClick: handleDelete,
          disabled: (member) => member.status?.toLowerCase() === 'accepted',
        };
      }

      if (action.tooltip === 'Copy Token') {
        return {
          ...action,
          onClick: (member) => {
            navigator.clipboard
              .writeText(member.token)
              .then(() => cogoToast.success('Token copied to clipboard!'))
              .catch(() => cogoToast.error('Failed to copy token.'));
          },
        };
      }

      return action;
    }),

    onSearchChange: setSearchQuery,
  };

  return (
    <>
      <div className="p-2">
        {isLoading ? (
          <div className="flex h-screen flex-col text-center p-6">
            <div className="absolute inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-custom-main border-t-transparent"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Token Counts */}
              <div className="flex flex-wrap gap-3 text-sm text-gray-600 font-medium">
                <div className="bg-gray-100 px-3 py-1.5 rounded-lg">
                  Total: <span className="font-semibold text-gray-800">{tokenCounts.total}</span>
                </div>
                <div className="bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-lg">
                  Pending: <span className="font-semibold">{tokenCounts.pending}</span>
                </div>
                <div className="bg-green-100 text-green-800 px-3 py-1.5 rounded-lg">
                  Accepted: <span className="font-semibold">{tokenCounts.accepted}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleGenerateToken}
                  className="px-4 py-2 text-sm font-semibold bg-custom-main text-white rounded-lg shadow hover:bg-custom-secondary transition"
                >
                  Generate Token
                </button>
                <button
                  onClick={handleExportTokens}
                  className="px-4 py-2 text-sm font-semibold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Export Tokens
                </button>
              </div>
            </div>

            <GenericTable
              {...updatedInvitationConfig}
              data={filteredMembers}
              searchQuery={searchQuery}
              enableSearch={true}
              enableDate={false}
            />

            {filteredMembers.length === 0 && searchQuery === '' && (
              <div className="flex justify-center mt-3">
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="px-4 py-2 bg-custom-main text-white rounded-lg shadow hover:bg-custom-secondary transition"
                >
                  Invite a Member
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {isInviteModalOpen && (
        <InviteModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        title={selectedMember?.name || 'this invitation'}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </>
  );
};

export default Invitation;
