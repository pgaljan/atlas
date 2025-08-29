import cogoToast from '@successtar/cogo-toast';
import Cookies from 'js-cookie';
import React, { useCallback, useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { IoTrash } from 'react-icons/io5';
import { MdAddTask } from 'react-icons/md';
import { TbDragDrop, TbEditCircle } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import CatalogModal from '../../../components/admin/modals/CatalogModal';
import DeleteModal from '../../../components/modals/DeleteModal';
import Tooltip from '../../../components/tooltip/Tooltip';
import { fetchPlans } from '../../../redux/slices/plans';
import {
  createCatalog,
  deleteCatalog,
  fetchCatalogs,
  reorderCatalogs,
  updateCatalog,
  updateCatalogOrder,
} from '../../../redux/slices/structure-catalog';
import { BiCarousel } from 'react-icons/bi';

const StructureCatalog = () => {
  const dispatch = useDispatch();
  const workspaceId = Cookies.get('workspaceId');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [CatalogName, setCatalogName] = useState('');
  const [selectedUserTier, setSelectedUserTier] = useState([]);
  const [file, setFile] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [description, setDescription] = useState('');
  const [plans, setPlans] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [editedCatalog, setEditedCatalog] = useState(null);
  const [catalogs, setCatalogs] = useState([]);
  const [deleting, setDeleting] = useState(false);

  const fetchPlansData = useCallback(async () => {
    const data = await dispatch(fetchPlans()).unwrap();
    setPlans(data);
    setSelectedUserTier(data?.[0]?.name || 'Personal');
  }, [dispatch]);

  const fetchCatalogData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dispatch(fetchCatalogs()).unwrap();

      const sorted = [...data].sort((a, b) => a.order - b.order);
      setCatalogs(sorted);
    } catch (error) {
      cogoToast.error(error?.message || 'Failed to load catalogs. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchPlansData();
    fetchCatalogData();
  }, [fetchPlansData, fetchCatalogData]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAddCatalog = async () => {
    if (!CatalogName || !file) {
      cogoToast.error('Please provide both a structure name and a file.');
      return;
    }

    const catalogData = {
      name: CatalogName,
      description,
      userTier: selectedUserTier,
      fileUrl: file,
      thumbnailUrl,
      workspaceId,
    };

    try {
      await dispatch(createCatalog(catalogData)).unwrap();
      await fetchCatalogData();
      cogoToast.success('Catalog added successfully!');
      setAddModalOpen(false);
      resetForm();
    } catch (error) {
      cogoToast.error(error?.message || 'Something went wrong while adding Catalog.');
    }
  };

  const handleEditCatalog = async () => {
    if (!editedCatalog) return;

    const updateCatalogDto = {
      name: CatalogName,
      description,
      userTier: selectedUserTier,
      fileUrl: file,
      thumbnailUrl,
      workspaceId,
    };

    try {
      await dispatch(updateCatalog({ id: editedCatalog.id, updateCatalogDto })).unwrap();
      await fetchCatalogData();
      cogoToast.success('Catalog updated successfully!');
      setEditModalOpen(false);
      resetForm();
    } catch (error) {
      cogoToast.error(error?.message || 'Something went wrong while updating Catalog.');
    }
  };

  const openDeleteModal = (catalog) => {
    setSelectedCatalog(catalog);
    setDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setSelectedCatalog(null);
    setDeleteModalOpen(false);
  };
  const confirmDelete = () => {
    setDeleting(true);
    if (selectedCatalog) {
      dispatch(deleteCatalog(selectedCatalog.id))
        .unwrap()
        .then(async () => {
          cogoToast.success('Catalog deleted successfully!');
          closeDeleteModal();
          setDeleting(false);
          await fetchCatalogData();
        })

        .catch((error) => {
          setDeleting(false);
          if (error?.status === 400) {
            cogoToast.error('Cannot delete catalog: Bad request.');
          } else {
            cogoToast.error(error?.message || 'Failed to delete catalog');
          }
        });
    }
  };

  const resetForm = () => {
    setCatalogName('');
    setDescription('');
    setFile(null);
    setSelectedUserTier(plans?.[0]?.name ? [plans[0].name] : []);
    setEditedCatalog(null);
    setThumbnailUrl(null);
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const updatedCatalogs = Array.from(catalogs);
    const [moved] = updatedCatalogs.splice(result.source.index, 1);
    updatedCatalogs.splice(result.destination.index, 0, moved);

    const reordered = updatedCatalogs.map((item, index) => ({
      ...item,
      order: index,
    }));

    setCatalogs(reordered);

    try {
      const payload = reordered.map(({ id, order }) => ({ id, order }));
      await dispatch(reorderCatalogs(payload)).unwrap();
      cogoToast.success('Catalogs reordered successfully!');
      fetchCatalogData();
    } catch (error) {
      cogoToast.error('Failed to reorder catalogs.');
    }
  };

  const handleOrderChange = async (catalogId, newOrder) => {
    const sanitized = parseInt(newOrder, 10);
    if (isNaN(sanitized) || sanitized < 0) return;

    try {
      await dispatch(updateCatalogOrder({ id: catalogId, order: sanitized })).unwrap();
      cogoToast.success('Catalog order updated successfully!');
      fetchCatalogData();
    } catch (err) {
      cogoToast.error('Failed to update catalog order.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-custom-main border-t-transparent"></div>
      </div>
    );
  }

  if (!Array.isArray(catalogs) || catalogs.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center p-6">
        <div className="flex items-center justify-center bg-white text-custom-main rounded-full w-28 h-28 mb-4">
          <BiCarousel className="text-5xl text-custom-main" />
        </div>
        <h2 className="text-2xl font-bold text-custom-text-grey mb-2">No catalogs found</h2>
        <p className="text-lg text-custom-text-grey mb-4">
          There are no catalogs available at the moment. <br />
          Please upload a new catalog to get started.
        </p>
        <button
          className="flex items-center border-2 border-custom-main gap-2 px-5 py-2 text-custom-main hover:bg-custom-main hover:text-white rounded-md transition"
          onClick={() => {
            resetForm();
            setAddModalOpen(true);
          }}
        >
          <MdAddTask size={20} />
          Upload Catalog
        </button>

        <CatalogModal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSubmit={handleAddCatalog}
          title="Add Catalog"
          CatalogName={CatalogName}
          setCatalogName={setCatalogName}
          description={description}
          setDescription={setDescription}
          thumbnailUrl={thumbnailUrl}
          setThumbnailUrl={setThumbnailUrl}
          selectedUserTier={selectedUserTier}
          setSelectedUserTier={setSelectedUserTier}
          userTiers={plans.map((plan) => plan.name)}
          file={file}
          setFile={setFile}
        />
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="p-10 rounded-[18px] bg-custom-background-white h-auto max-h-[90%] shadow-md">
        <div className="mb-6 flex justify-between w-full items-center">
          <h2 className="text-3xl font-semibold text-gray-800">Structures Catalog</h2>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-custom-main rounded-lg shadow-md hover:bg-gray-300 transition"
            onClick={() => {
              resetForm();
              setAddModalOpen(true);
            }}
          >
            <MdAddTask size={20} />
            Upload Catalog
          </button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <table className="w-full">
            <thead className="border-b border-gray-100">
              <tr>
                <th className="px-5 py-3"></th>
                <th className="px-5 py-3 text-left">Catalog Name</th>
                <th className="px-5 py-3 text-left">Description</th>
                <th className="px-5 py-3 text-left">User Tier</th>
                <th className="px-5 py-3 text-left">Thumbnail</th>
                {/* <th className="px-5 py-3 text-left">Order</th> */}
                <th className="px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <Droppable droppableId="catalogs">
              {(provided) => (
                <tbody
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="divide-y divide-gray-100"
                >
                  {catalogs.map((catalog, index) => (
                    <Draggable key={catalog.id} draggableId={catalog.id} index={index}>
                      {(prov) => (
                        <tr
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="px-4 py-3 cursor-grab" {...prov.dragHandleProps}>
                            <TbDragDrop />
                          </td>
                          <td className="px-5 py-4 text-gray-500 capitalize">{catalog.name}</td>
                          <td className="px-5 py-4 text-gray-500">
                            {catalog.description
                              ? catalog.description.length > 45
                                ? `${catalog.description.substring(0, 45)}...`
                                : catalog.description
                              : 'N/A'}
                          </td>
                          <td className="px-5 py-4 text-gray-500">
                            {catalog.userTier.map((t) => t.tier).join(', ')}
                          </td>
                          <td className="px-5 py-4">
                            {catalog.thumbnailUrl ? (
                              <img
                                src={catalog.thumbnailUrl}
                                alt="Thumbnail"
                                className="h-12 w-12 object-cover rounded"
                              />
                            ) : (
                              <span className="text-gray-500">No Image</span>
                            )}
                          </td>

                          <td className="px-5 py-4 flex gap-3">
                            <Tooltip label="Edit">
                              <button
                                className="p-2 text-black rounded transition"
                                onClick={() => {
                                  setEditedCatalog(catalog);
                                  setCatalogName(catalog.name);
                                  setDescription(catalog.description || '');
                                  setSelectedUserTier(catalog.userTier.map((u) => u.tier));
                                  setFile(catalog.fileUrl);
                                  setThumbnailUrl(catalog.thumbnailUrl);
                                  setEditModalOpen(true);
                                }}
                              >
                                <TbEditCircle className="w-5 h-5" />
                              </button>
                            </Tooltip>
                            <Tooltip label="Delete">
                              <button
                                className="p-2 text-red-500 rounded transition"
                                onClick={() => openDeleteModal(catalog)}
                              >
                                <IoTrash className="w-5 h-5" />
                              </button>
                            </Tooltip>
                          </td>
                        </tr>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </tbody>
              )}
            </Droppable>
          </table>
        </DragDropContext>

        <CatalogModal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSubmit={handleAddCatalog}
          title="Add Catalog"
          CatalogName={CatalogName}
          setCatalogName={setCatalogName}
          description={description}
          setDescription={setDescription}
          thumbnailUrl={thumbnailUrl}
          setThumbnailUrl={setThumbnailUrl}
          selectedUserTier={selectedUserTier}
          setSelectedUserTier={setSelectedUserTier}
          userTiers={plans.map((plan) => plan.name)}
          file={file}
          setFile={setFile}
        />

        <CatalogModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleEditCatalog}
          title={`Update ${CatalogName}`}
          CatalogName={CatalogName}
          setCatalogName={setCatalogName}
          description={description}
          setDescription={setDescription}
          file={file}
          thumbnailUrl={thumbnailUrl}
          setFile={setFile}
          setThumbnailUrl={setThumbnailUrl}
          handleFileChange={handleFileChange}
          selectedUserTier={selectedUserTier}
          setSelectedUserTier={setSelectedUserTier}
          userTiers={plans.map((plan) => plan.name)}
        />

        <DeleteModal
          isOpen={deleteModalOpen}
          onClose={closeDeleteModal}
          loading={deleting}
          onConfirm={confirmDelete}
          title={selectedCatalog?.name}
        />
      </div>
    </div>
  );
};

export default StructureCatalog;
