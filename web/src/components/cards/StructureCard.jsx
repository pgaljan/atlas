import cogoToast from '@successtar/cogo-toast';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { PiTreeStructureBold } from 'react-icons/pi';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/cards/Card';
import { createFullUserBackup } from '../../redux/slices/backups';
import { restoreFullBackup } from '../../redux/slices/restore-backups';
import { getStructuresByWorkspaceId } from '../../redux/slices/structures';
import { formatRelativeTime } from '../../utils/timeUtils';
import ImportModal from '../modals/ImportModal';
import LoadingSpinner from '../loader/LoadingSpinner';

const StructureCard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const ownerId = Cookies.get('atlas_userId');
  const workspaceId = Cookies.get('workspaceId');
  const username = Cookies.get('atlas_username');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const toggleImportModal = () => {
    setIsImportModalOpen((prev) => !prev);
  };

  const fetchStructures = () => {
    if (ownerId) {
      setLoading(true);
      dispatch(getStructuresByWorkspaceId(workspaceId))
        .then((data) => {
          const sortedStructures = Array.isArray(data?.payload)
            ? data.payload.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            : [];
          setStructures(sortedStructures);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchStructures();
  }, [dispatch, ownerId]);

  const handleClick = (structureId) => {
    navigate(`/app/s/${username}/${structureId}`);
  };

  const handleExport = () => {
    if (!ownerId) return;

    setIsExporting(true);

    dispatch(createFullUserBackup(ownerId))
      .then((action) => {
        if (createFullUserBackup.fulfilled.match(action)) {
          const { fileUrl } = action.payload;
          if (fileUrl) {
            setTimeout(() => {
              setIsExporting(false);
              window.open(fileUrl, '_blank');
            }, 2000);
          } else {
            setIsExporting(false);
          }
        } else {
          setIsExporting(false);
        }
      })
      .catch((error) => {
        cogoToast.error('Failed to export backup! Please try again.');
        setIsExporting(false);
      });
  };

  const handleFileSelection = (file) => {
    if (!file) {
      cogoToast.error('Please select a valid structure!');
      return;
    }

    setIsImportModalOpen(false);
    handleFileUpload(file);
  };

  const handleFileUpload = async (file) => {
    try {
      setIsImporting(true);
      await dispatch(restoreFullBackup(file)).unwrap();
      cogoToast.success('Backup restored successfully!');
      fetchStructures();
      setIsImportModalOpen(false);
    } catch (err) {
      cogoToast.error('Failed to upload structure.');
    } finally {
      setIsImporting(false);
    }
  };
  return (
    <div className="p-2 flex flex-col h-full min-h-0">
      {loading ? (
        <LoadingSpinner mode="overlay" message="Loading structures..." />
      ) : structures.length === 0 ? (
        <div className="flex h-screen flex-col text-center p-6">
          <div className="flex flex-col items-center justify-center flex-grow">
            <div className="flex items-center justify-center bg-white rounded-full w-28 h-28 mb-4">
              <PiTreeStructureBold className="text-5xl text-custom-main" />
            </div>
            <h2 className="text-2xl font-bold text-custom-text-grey mb-4">No structures found.</h2>
            <p className="text-lg text-custom-text-grey">Start creating your first structure!</p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-[18px] bg-custom-background-white h-auto shadow-md">
          <div className="flex justify-between w-full items-center mb-3">
            <div>
              <h2 className="text-[24px] font-bold text-black">Dashboard</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {structures?.map((structure) => (
              <Card
                key={structure.id}
                title={structure.title || 'Untitled'}
                imageUrl={structure.imageUrl || '/assets/markmap-image.png'}
                footerTitle={`Modified ${formatRelativeTime(structure.updatedAt)}`}
                username={username}
                permission={
                  structure.shareInvitations?.[0]?.permission ||
                  structure.shares?.[0]?.permission ||
                  'owner'
                }
                owner={structure.owner}
                structureId={structure.id}
                footerSubtitle={username || 'Unknown User'}
                avatarUrl={structure.avatarUrl || '/assets/userimg.jpeg'}
                onActionClick={() => handleClick(structure.id)}
                onSuccess={fetchStructures}
                structureType={structure.type || 'default'}
              />
            ))}
          </div>
        </div>
      )}

      {isImportModalOpen && (
        <ImportModal
          isOpen={isImportModalOpen}
          onClose={toggleImportModal}
          title={'Import Backups'}
          onSuccess={fetchStructures}
          isLoading={loading}
          handleFileSelection={handleFileSelection}
          buttonText={'Restore'}
          format={'.zip'}
        />
      )}
    </div>
  );
};

export default StructureCard;
