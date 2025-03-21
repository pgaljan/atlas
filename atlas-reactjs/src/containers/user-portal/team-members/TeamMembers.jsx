import React, { useState } from "react";
import GenericTable from "../../../components/generic-table/GenericTable";
import Layout from "../../../components/layout";
import DeleteModal from "../../../components/modals/DeleteModal";
import ModalComponent from "../../../components/modals/Modal";
import { teamMembersConfig } from "../../../constants/index";
import InputField from "../../../components/input-field/InputField";

const TeamMembersPage = ({ onSubmit }) => {
  const [teamMembers, setTeamMembers] = useState([
    {
      id: "61ef352e-ed80-4e25-8229-091eb79dcb49",
      name: "John Doe",
      email: "john@gmail.com",
      userType: "admin",
      lastAccess: "12-23-2024 12:00 pm",
      status: "Active",
      joinDate: "12-23-2024 12:00 pm",
    },
    {
      id: "61ef352e-ed80-4e25-8229-091eb79dcs321",
      name: "Jane Smith",
      email: "jane.smith@email.com",
      userType: "member",
      lastAccess: "01-10-2025 09:30 am",
      status: "Inactive",
      joinDate: "01-05-2025 02:15 pm",
    },

  ]);

  const [selectedMember, setSelectedMember] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  // Edit Modal Handler
  const handleEdit = (member) => {
    setSelectedMember(member);
    setFormData({ name: member.name, email: member.email });
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

  // Confirm Delete
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
