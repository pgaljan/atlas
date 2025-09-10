import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import GenericTable from '../../../components/generic-table/GenericTable';
import DeleteModal from '../../../components/modals/DeleteModal';
import { mediaConfig } from '../../../constants';
import { fetchMediaByUserId } from '../../../redux/slices/upload-files';
import cogoToast from '@successtar/cogo-toast';

const UploadedFiles = () => {
  const dispatch = useDispatch();
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const userId = Cookies.get('atlas_userId');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) {
          cogoToast.error('User ID is not available in cookies.');
          return;
        }

        const result = await dispatch(fetchMediaByUserId(userId)).unwrap();
        setFiles(result);
      } catch (err) {
        cogoToast.error('Failed to fetch files. Please try again.');
      }
    };

    fetchData();
  }, [dispatch]);

  const handleEdit = (file) => {
    setSelectedFile(file);
    setIsEditModalOpen(true);
  };

  const handleDelete = (file) => {
    setSelectedFile(file);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedFile) return;

    setDeleting(true);

    try {
      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== selectedFile.id));

      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  const tableData = files.map((file) => ({
    id: file.id,
    fileUrl: file.fileUrl,
    fileType: file.fileType || 'Unknown',
    updatedAt: new Date(file.updatedAt).toLocaleString(),
    status: file.status,
  }));

  const updatedMediaConfig = {
    ...mediaConfig,
    actions: mediaConfig.actions.map((action) => {
      if (action.tooltip === 'Edit') {
        return { ...action, onClick: handleEdit };
      } else if (action.tooltip === 'Delete') {
        return { ...action, onClick: handleDelete };
      }
      return action;
    }),
  };

  return (
    <>
      <div className="p-2">
        <GenericTable {...updatedMediaConfig} data={tableData} />
      </div>

      {isEditModalOpen && (
        <div className="modal">
          <h2>Edit File</h2>
          <p>{selectedFile?.fileUrl}</p>
          <button onClick={() => setIsEditModalOpen(false)}>Close</button>
        </div>
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        title={'this file'}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </>
  );
};

export default UploadedFiles;
