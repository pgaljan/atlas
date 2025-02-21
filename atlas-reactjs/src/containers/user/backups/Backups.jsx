import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import GenericTable from "../../../components/generic-table/GenericTable";
import Layout from "../../../components/layout";
import DeleteModal from "../../../components/modals/DeleteModal";
import { backupConfig } from "../../../constants";
import { fetchBackupsByUserId } from "../../../redux/slices/backups";

const Backups = ({ onSubmit }) => {
  const dispatch = useDispatch();
  const userId = Cookies.get("atlas_userId");
  const [backups, setBackups] = useState([]);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) {
          console.error("User ID is not available in cookies.");
          return;
        }
        const result = await dispatch(fetchBackupsByUserId(userId)).unwrap();
        setBackups(result);
      } catch (err) {
        console.error("Error fetching backups:", err);
      }
    };

    fetchData();
  }, [dispatch]);

  // Edit Modal Handler
  const handleEdit = (item) => {
    setSelectedBackup(item);
    setIsEditModalOpen(true);
  };

  // Delete Modal Handler
  const handleDelete = (item) => {
    setSelectedBackup(item);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete
  const confirmDelete = () => {
    if (!selectedBackup) return;

    // Remove backup from state
    setBackups((prevBackups) =>
      prevBackups.filter((backup) => backup.id !== selectedBackup.id)
    );

    // Close modal
    setIsDeleteModalOpen(false);
  };

  // Attach Handlers to Actions
  const updatedBackupConfig = {
    ...backupConfig,
    actions: backupConfig.actions.map((action) => {
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
        <GenericTable {...updatedBackupConfig} data={backups} />
      </div>

      {/* Edit Modal (Placeholder) */}
      {isEditModalOpen && (
        <div className="modal">
          <h2>Edit Backup</h2>
          <p>{selectedBackup?.title}</p>
          <button onClick={() => setIsEditModalOpen(false)}>Close</button>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        title={selectedBackup?.title || "this item"}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </Layout>
  );
};

export default Backups;
