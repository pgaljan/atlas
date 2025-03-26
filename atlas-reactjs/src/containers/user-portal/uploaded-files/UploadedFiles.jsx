import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import GenericTable from "../../../components/generic-table/GenericTable";
import Layout from "../../../components/layout";
import DeleteModal from "../../../components/modals/DeleteModal";
import { mediaConfig } from "../../../constants";
import { fetchMediaByUserId } from "../../../redux/slices/upload-files";

const UploadedFiles = ({ onSubmit }) => {
  const dispatch = useDispatch();
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const userId = Cookies.get("atlas_userId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) {
          console.error("User ID is not available in cookies.");
          return;
        }

        const result = await dispatch(fetchMediaByUserId(userId)).unwrap();
        setFiles(result);
      } catch (err) {
        console.error("Error fetching files:", err);
      }
    };

    fetchData();
  }, [dispatch]);

  // Edit Modal Handler
  const handleEdit = (file) => {
    setSelectedFile(file);
    setIsEditModalOpen(true);
  };

  // Delete Modal Handler
  const handleDelete = (file) => {
    setSelectedFile(file);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete
  const confirmDelete = () => {
    if (!selectedFile) return;

    // Remove the file from state
    setFiles((prevFiles) =>
      prevFiles.filter((file) => file.id !== selectedFile.id)
    );

    // Close modal
    setIsDeleteModalOpen(false);
  };

  // Transform files data for GenericTable
  const tableData = files.map((file) => ({
    id: file.id,
    fileUrl: file.fileUrl,
    fileType: file.fileType || "Unknown",
    updatedAt: new Date(file.updatedAt).toLocaleString(),
    status: file.status,
  }));

  // Attach Handlers to Actions
  const updatedMediaConfig = {
    ...mediaConfig,
    actions: mediaConfig.actions.map((action) => {
      if (action.tooltip === "Edit") {
        return { ...action, onClick: handleEdit };
      } else if (action.tooltip === "Delete") {
        return { ...action, onClick: handleDelete };
      }
      return action;
    }),
  };

  return (
    <Layout onSubmit={onSubmit}>
      <div className="p-2">
        <GenericTable {...updatedMediaConfig} data={tableData} />
      </div>

      {/* Edit Modal (Placeholder) */}
      {isEditModalOpen && (
        <div className="modal">
          <h2>Edit File</h2>
          <p>{selectedFile?.fileUrl}</p>
          <button onClick={() => setIsEditModalOpen(false)}>Close</button>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        title={"this file"}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </Layout>
  );
};

export default UploadedFiles;
