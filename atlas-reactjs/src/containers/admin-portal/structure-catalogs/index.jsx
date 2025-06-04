import cogoToast from "@successtar/cogo-toast";
import Cookies from "js-cookie";
import React, { useCallback, useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { IoTrash } from "react-icons/io5";
import { MdAddTask } from "react-icons/md";
import { TbDragDrop, TbEditCircle } from "react-icons/tb";
import { useDispatch } from "react-redux";
import AdminLayout from "../../../components/admin/admin-layout";
import CatalogModal from "../../../components/admin/modals/CatalogModal";
import DeleteModal from "../../../components/modals/DeleteModal";
import Tooltip from "../../../components/tooltip/Tooltip";
import { fetchPlans } from "../../../redux/slices/plans";
import {
  createCatalog,
  deleteCatalog,
  fetchCatalogs,
  reorderCatalogs,
  updateCatalog,
  updateCatalogOrder,
} from "../../../redux/slices/structure-catalog";

const StructureCatalog = () => {
  const dispatch = useDispatch();
  const workspaceId = Cookies.get("workspaceId");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [CatalogName, setCatalogName] = useState("");
  const [selectedUserTier, setSelectedUserTier] = useState([]);
  const [file, setFile] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [description, setDescription] = useState("");
  const [orderInputs, setOrderInputs] = useState({});
  const [plans, setPlans] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [editedCatalog, setEditedCatalog] = useState(null);
  const [catalogs, setCatalogs] = useState([]);

  // Fetch Plans & set default user tier from backend
  const fetchPlansData = useCallback(async () => {
    const data = await dispatch(fetchPlans()).unwrap();
    setPlans(data);
    setSelectedUserTier(data?.[0]?.name || "Personal");
  }, [dispatch]);

  // Fetch Catalogs
  const fetchCatalogData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dispatch(fetchCatalogs()).unwrap();
      setCatalogs(data);
    } catch (error) {
      console.error("Failed to fetch catalogs:", error);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchPlansData();
    fetchCatalogData();
  }, [fetchPlansData, fetchCatalogData]);

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle adding new catalog
  const handleAddCatalog = async () => {
    if (!CatalogName || !file) {
      cogoToast.error("Please provide both a structure name and a file.");
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
      cogoToast.success("Catalog added successfully!");
      setAddModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error creating catalog:", error);
      cogoToast.error(
        error?.message || "Something went wrong while adding Catalog."
      );
    }
  };

  // Handle editing catalog
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
      await dispatch(
        updateCatalog({ id: editedCatalog.id, updateCatalogDto })
      ).unwrap();
      await fetchCatalogData();
      cogoToast.success("Catalog updated successfully!");
      setEditModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error updating catalog:", error);
      cogoToast.error(
        error?.message || "Something went wrong while updating Catalog."
      );
    }
  };

  // Delete modal
  const openDeleteModal = (catalog) => {
    setSelectedCatalog(catalog);
    setDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setSelectedCatalog(null);
    setDeleteModalOpen(false);
  };
  const confirmDelete = () => {
    if (selectedCatalog) {
      dispatch(deleteCatalog(selectedCatalog.id))
        .unwrap()
        .then(async () => {
          cogoToast.success("Catalog deleted successfully!");
          closeDeleteModal();
          await fetchCatalogData();
        })
        .catch((error) => {
          if (error?.status === 400) {
            cogoToast.error("Cannot delete catalog: Bad request.");
          } else {
            cogoToast.error(error?.message || "Failed to delete catalog");
          }
        });
    }
  };

  // Reset form
  const resetForm = () => {
    setCatalogName("");
    setDescription("");
    setFile(null);
    setSelectedUserTier(plans?.[0]?.name ? [plans[0].name] : []);
    setEditedCatalog(null);
    setThumbnailUrl(null);
  };

  // Drag & Drop Reordering
  const handleDragEnd = async (result) => { 
    if (!result.destination) return;

    const updatedCatalogs = Array.from(catalogs);
    const [moved] = updatedCatalogs.splice(result.source.index, 1);
    updatedCatalogs.splice(result.destination.index, 0, moved);
    setCatalogs(updatedCatalogs);

    try {
      const payload = updatedCatalogs.map((cat, idx) => ({
        id: cat.id,
        order: idx,
      }));
      await dispatch(reorderCatalogs(payload)).unwrap();
      cogoToast.success("Catalogs reordered successfully!");
    } catch (error) {
      cogoToast.error("Failed to reorder catalogs.");
    }
  };

  const handleOrderChange = async (catalogId, newOrder) => {
    const sanitized = parseInt(newOrder, 10);
    if (isNaN(sanitized) || sanitized < 0) return;

    try {
      await dispatch(
        updateCatalogOrder({ id: catalogId, order: sanitized })
      ).unwrap();
      cogoToast.success("Catalog order updated successfully!");
      fetchCatalogData();
    } catch (err) {
      cogoToast.error("Failed to update catalog order.");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-screen items-center justify-center text-center p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-custom-main border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4">
        <div className="p-10 rounded-[18px] bg-custom-background-white h-auto max-h-[90%] shadow-md">
          <div className="mb-6 flex justify-between w-full items-center">
            <h2 className="text-3xl font-semibold text-gray-800">
              Structures Catalog
            </h2>
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
                  <th className="px-5 py-3 text-left">Order</th>
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
                      <Draggable
                        key={catalog.id}
                        draggableId={catalog.id}
                        index={index}
                      >
                        {(prov) => (
                          <tr
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            className="hover:bg-gray-50 transition"
                          >
                            <td
                              className="px-4 py-3 cursor-grab"
                              {...prov.dragHandleProps}
                            >
                              <TbDragDrop />
                            </td>
                            <td className="px-5 py-4 text-gray-500 capitalize">
                              {catalog.name}
                            </td>
                            <td className="px-5 py-4 text-gray-500">
                              {catalog.description
                                ? catalog.description.length > 45
                                  ? `${catalog.description.substring(0, 45)}...`
                                  : catalog.description
                                : "N/A"}
                            </td>
                            <td className="px-5 py-4 text-gray-500">
                              {catalog.userTier.map((t) => t.tier).join(", ")}
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
                            <td className="px-5 py-4">
                              <input
                                type="number"
                                className="w-16 border rounded px-2 py-1 text-center"
                                value={orderInputs[catalog.id] ?? index}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setOrderInputs((prev) => ({
                                    ...prev,
                                    [catalog.id]: value,
                                  }));
                                }}
                                onBlur={() =>
                                  handleOrderChange(
                                    catalog.id,
                                    orderInputs[catalog.id] ?? index
                                  )
                                }
                              />
                            </td>

                            <td className="px-5 py-4 flex gap-3">
                              <Tooltip label="Edit">
                                <button
                                  className="p-2 text-black rounded transition"
                                  onClick={() => {
                                    setEditedCatalog(catalog);
                                    setCatalogName(catalog.name);
                                    setDescription(catalog.description || "");
                                    setSelectedUserTier(
                                      catalog.userTier.map((u) => u.tier)
                                    );
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
            title="Edit Catalog"
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
            onConfirm={confirmDelete}
            title={selectedCatalog?.name}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default StructureCatalog;
