import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import cogoToast from "@successtar/cogo-toast";
import Cookies from "js-cookie";
import GenericTable from "../../../components/generic-table/GenericTable";
import Layout from "../../../components/layout";
import DeleteModal from "../../../components/modals/DeleteModal";
import ModalComponent from "../../../components/modals/Modal";
import { teamMembersConfig } from "../../../constants/index";
import InputField from "../../../components/input-field/InputField";
import { fetchTeamMembers } from "../../../redux/slices/team-memebers";

const TeamMembersPage = ({ onSubmit }) => {
  const dispatch = useDispatch();
  const workspaceId = Cookies.get("workspaceId");

  // Team members state and loading/error states
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!workspaceId) {
          console.error("Workspace ID is not available in cookies.");
          return;
        }
        setIsLoading(true);
        const result = await dispatch(fetchTeamMembers(workspaceId)).unwrap();

        // Map the fetched data to match the existing teamMembers state structure
        const formattedMembers = result.map((member) => ({
          id: member.id,
          name: member.user?.fullName || member.user?.username || "Unknown",
          email: member.user?.email || "No email",
          userType: member.role,
          lastAccess: member.createdAt,
          status: member.user?.status || "N/A",
          joinDate: new Date(member.createdAt).toLocaleString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
        }));
        setTeamMembers(formattedMembers);
      } catch (err) {
        console.error("Error fetching team members:", err);
        setError(err?.message || "Failed to fetch team members.");
        cogoToast.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dispatch, workspaceId, error]);

  // Edit Modal Handler
  const handleEdit = (member) => {
    setSelectedMember(member);
    setFormData({ name: member?.user?.name, email: member?.user?.email });
    setIsEditModalOpen(true);
  };

  const saveEdit = () => {
    setTeamMembers((prevMembers) =>
      prevMembers.map((member) =>
        member.id === selectedMember.id ? { ...member, ...formData } : member
      )
    );
    setIsEditModalOpen(false);
  };

  // Delete Modal Handler
  const handleDelete = (member) => {
    setSelectedMember(member);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedMember) return;

    setTeamMembers((prevMembers) =>
      prevMembers.filter((member) => member.id !== selectedMember.id)
    );
    setIsDeleteModalOpen(false);
  };

  // Attach Handlers to Actions
  const updatedTeamMembersConfig = {
    ...teamMembersConfig,
    actions: teamMembersConfig.actions.map((action) => {
      if (action.tooltip === "Edit") {
        return { ...action, onClick: handleEdit };
      } else if (action.tooltip === "Delete") {
        return { ...action, onClick: handleDelete };
      }
      return action;
    }),
  };

  const handleKeyPress = (e) => {
    if (e?.key === "Enter") {
      saveEdit();
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Layout onSubmit={onSubmit}>
      <div className="p-2">
        <GenericTable {...updatedTeamMembersConfig} data={teamMembers} />
      </div>

      {/* Edit Modal using ModalComponent */}
      <ModalComponent
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Team Member"
        onSubmit={saveEdit}
        submitText="Save Changes"
      >
        <InputField
          type="text"
          label="Name"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          onKeyDown={handleKeyPress}
        />
        <InputField
          type="email"
          label="Email"
          name="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          onKeyDown={handleKeyPress}
        />
      </ModalComponent>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        title={selectedMember?.name || "this member"}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </Layout>
  );
};

export default TeamMembersPage;
