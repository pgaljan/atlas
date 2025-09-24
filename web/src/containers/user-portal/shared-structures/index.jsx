import cogoToast from '@successtar/cogo-toast';
import { PiTreeStructureBold } from 'react-icons/pi';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import Card from '../../../components/cards/Card';
import LoadingSpinner from '../../../components/loader/LoadingSpinner';
import { fetchSharedStructures, acceptInvitation } from '../../../redux/slices/structure-sharing';
import { formatRelativeTime } from '../../../utils/timeUtils';

const SharedStructures = () => {
  const dispatch = useDispatch();
  const { sharedStructures = [], loading } = useSelector((state) => state.structureShares || {});

  const [showPendingModal, setShowPendingModal] = useState(false);

  useEffect(() => {
    dispatch(fetchSharedStructures());
  }, [dispatch]);

  const pendingInvites = sharedStructures.filter((s) =>
    (s.shareInvitations || []).some((inv) => inv.status === 'pending'),
  );

  const activeShares = sharedStructures.filter(
    (s) => !(s.shareInvitations || []).some((inv) => inv.status === 'pending'),
  );

  return (
    <div className="p-2 flex flex-col h-full min-h-0">
      {loading.shares ? (
        <LoadingSpinner mode="overlay" message="Loading shared structures..." />
      ) : sharedStructures.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <div className="flex items-center justify-center w-28 h-28 mb-4 bg-white rounded-full">
            <PiTreeStructureBold className="text-5xl text-custom-main" />
          </div>
          <h2 className="text-2xl font-bold text-custom-text-grey mb-4">
            No shared structures found.
          </h2>
          <p className="text-lg text-custom-text-grey">
            Structures shared with you will appear here!
          </p>
        </div>
      ) : (
        <div className="p-4 rounded-[18px] bg-custom-background-white h-auto shadow-md">
          <div className="flex justify-between w-full items-center mb-3">
            <h2 className="text-[24px] font-bold text-black">Shared Structures</h2>
          </div>

          {pendingInvites.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                <p className="text-sm text-yellow-800">
                  You have <span className="font-semibold">{pendingInvites.length}</span> pending
                  invitation{pendingInvites.length > 1 ? 's' : ''}.
                </p>
              </div>
              <button
                onClick={() => setShowPendingModal(true)}
                className="text-sm font-medium px-4 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
              >
                View Details
              </button>
            </div>
          )}

          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {activeShares?.map((s) => {
                return (
                  <div key={s.id} className="flex flex-col">
                    <Card
                      key={s.id}
                      title={s?.name || s?.title || 'Untitled'}
                      imageUrl={s.imageUrl || '/assets/markmap-image.png'}
                      footerTitle={`Modified ${formatRelativeTime(s.updatedAt)}`}
                      username={s.owner?.username || s.ownerId}
                      permission={
                        s.shares?.[0]?.permission || s.shareInvitations?.[0]?.permission || 'viewer'
                      }
                      owner={s.owner}
                      structureId={s.id}
                      footerSubtitle={s.owner?.username || 'Unknown'}
                      avatarUrl={s.owner?.profileUrl || '/assets/userimg.jpeg'}
                      onActionClick={() => {
                        window.location.href = `/app/s/${s.owner?.username || s?.ownerId}/${s.id}`;
                      }}
                      onSuccess={() => dispatch(fetchSharedStructures())}
                      structureType={s?.type || 'default'}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showPendingModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h3 className="text-lg font-bold mb-4">Pending Invitations</h3>

            <button
              onClick={() => setShowPendingModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
            >
              &times;
            </button>

            <div className="max-h-[400px] overflow-y-auto pr-2">
              {pendingInvites?.map((s) => {
                const pendingInv = (s.shareInvitations || []).find(
                  (inv) => inv.status === 'pending',
                );

                if (!pendingInv) return null;

                return (
                  <div
                    key={pendingInv.id}
                    className="border p-3 rounded-lg mb-3 bg-gray-50 shadow-sm hover:shadow transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg overflow-hidden">
                        {/* inviter initials fallback */}
                        {pendingInv.inviter?.displayName
                          ? pendingInv.inviter.displayName
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')
                          : pendingInv.inviter?.username?.slice(0, 2)?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {s.name || 'Untitled Structure'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Invited by{' '}
                          <span className="font-medium text-gray-700">
                            {pendingInv.inviter?.displayName ||
                              pendingInv.inviter?.username ||
                              'Unknown'}
                          </span>
                        </p>
                        <p className="text-xs text-gray-400">
                          Expires:{' '}
                          {pendingInv.expiresAt
                            ? new Date(pendingInv.expiresAt).toLocaleString()
                            : '—'}
                        </p>
                      </div>
                    </div>

                    {pendingInv.message && (
                      <div className="mt-3 p-3 bg-white rounded-md border border-gray-100 text-sm text-gray-700">
                        <div className="text-xs text-gray-500 mb-2">Message from inviter</div>
                        <div className="whitespace-pre-wrap break-words">{pendingInv?.message}</div>
                      </div>
                    )}

                    <button
                      onClick={async () => {
                        try {
                          await dispatch(acceptInvitation({ id: pendingInv.id })).unwrap();
                          cogoToast.success('Invitation accepted');
                          dispatch(fetchSharedStructures());
                          setShowPendingModal(false);
                        } catch (err) {
                          cogoToast.error(err?.message || 'Failed to accept');
                        }
                      }}
                      className="mt-3 w-full py-2 bg-custom-main text-white rounded hover:bg-custom-main/90 transition"
                    >
                      Accept Invitation
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedStructures;
