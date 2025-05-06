import cogoToast from "@successtar/cogo-toast";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import GenericTable from "../../../components/generic-table/GenericTable";
import Layout from "../../../components/layout";
import DeleteModal from "../../../components/modals/DeleteModal";
import { backupConfig } from "../../../constants";
import {
  deleteBackup,
  fetchBackupsByWorkspaceId,
} from "../../../redux/slices/backups";

const Backups = ({ onSubmit }) => {
  const dispatch = useDispatch();
  const workspaceId = Cookies.get("workspaceId");
  const [backups, setBackups] = useState([]);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true); // loading state added

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!workspaceId) {
          console.error("Workspace ID is not available in cookies.");
          return;
        }
        setLoading(true); // start loading
        const result = await dispatch(
          fetchBackupsByWorkspaceId(workspaceId)
        ).unwrap();
        setBackups(result);
      } catch (err) {
        console.error("Error fetching backups:", err);
      } finally {
        setLoading(false); // end loading
      }
    };

    fetchData();
  }, [dispatch, workspaceId]);

  // Delete Modal Handler
  const handleDelete = (item) => {
    setSelectedBackup(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedBackup) return;

    try {
      await dispatch(deleteBackup(selectedBackup.id)).unwrap();
      cogoToast.success("Backup deleted successfully!");
      setBackups((prevBackups) =>
        prevBackups.filter((backup) => backup.id !== selectedBackup.id)
      );
    } catch (error) {
      cogoToast.error("Error deleting backup.");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const updatedBackupConfig = {
    ...backupConfig,
    actions: backupConfig.actions.map((action) => {
      if (action.tooltip === "Delete") {
        return { ...action, onClick: handleDelete };
      }
      return action;
    }),
  };

  return (
    <Layout onSubmit={onSubmit}>
      <div className="p-2">
        {loading ? (
          <div className="flex h-screen flex-col text-center p-6">
            <div className="absolute inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-custom-main border-t-transparent"></div>
            </div>
          </div>
        ) : (
          <GenericTable {...updatedBackupConfig} data={backups} />
        )}
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        title={"this item"}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </Layout>
  );
};

export default Backups;
