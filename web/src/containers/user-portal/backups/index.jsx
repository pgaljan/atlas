import cogoToast from '@successtar/cogo-toast';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import GenericTable from '../../../components/generic-table/GenericTable';
import DeleteModal from '../../../components/modals/DeleteModal';
import { backupConfig } from '../../../constants';
import {
  deleteBackup,
  fetchBackupsByWorkspaceId,
  searchBackupsByDate,
  searchBackupsByTitle,
} from '../../../redux/slices/backups';
import LoadingSpinner from '../../../components/loader/LoadingSpinner';

const Backups = () => {
  const dispatch = useDispatch();
  const workspaceId = Cookies.get('workspaceId');
  const [backups, setBackups] = useState([]);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!workspaceId) {
          console.error('Workspace ID is not available in cookies.');
          return;
        }
        setLoading(true);
        const result = await dispatch(fetchBackupsByWorkspaceId(workspaceId)).unwrap();
        setBackups(result);
      } catch (err) {
        console.error('Error fetching backups:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, workspaceId]);

  const handleSearch = async (query) => {
    try {
      setLoading(true);

      if (!query) {
        const result = await dispatch(fetchBackupsByWorkspaceId(workspaceId)).unwrap();
        setBackups(result);
        return;
      }

      const result = await dispatch(searchBackupsByTitle({ title: query, workspaceId })).unwrap();

      setBackups(result?.data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterByDate = async (date) => {
    try {
      setLoading(true);
      if (!date) return;

      const dateString = date.toISOString().split('T')[0];
      const result = await dispatch(searchBackupsByDate({ date: dateString })).unwrap();

      setBackups(result?.data || []);
    } catch (error) {
      cogoToast.error(`Search failed: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (item) => {
    setSelectedBackup(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedBackup) return;

    setDeleting(true);

    try {
      await dispatch(deleteBackup(selectedBackup.id)).unwrap();

      cogoToast.success('Backup deleted successfully!');

      setBackups((prevBackups) => prevBackups.filter((backup) => backup.id !== selectedBackup.id));
    } catch (error) {
      cogoToast.error(error?.message || 'Error deleting backup. Please try again.');
    } finally {
      setDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      handleFilterByDate(selectedDate);
    }
  }, [selectedDate]);

  const updatedBackupConfig = {
    ...backupConfig,
    actions: backupConfig.actions.map((action) => {
      if (action.tooltip === 'Delete') {
        return { ...action, onClick: handleDelete };
      }
      return action;
    }),
  };

  return (
    <>
      <div className="p-2 flex flex-col h-full min-h-0">
        {loading ? (
          <LoadingSpinner mode="overlay" message="Loading backups..." />
        ) : (
          <GenericTable
            {...updatedBackupConfig}
            data={backups}
            enableSearch={true}
            enableDate={true}
            showTitle={true}
            searchQuery={searchQuery}
            onSearchChange={(val) => {
              setSearchQuery(val);
            }}
            onSearch={handleSearch}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            handleFilterByDate={handleFilterByDate}
            filterByDate="true"
          />
        )}
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        title={'this item'}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </>
  );
};

export default Backups;
