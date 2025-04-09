import cogoToast from "@successtar/cogo-toast";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import GenericTable from "../../../components/generic-table/GenericTable";
import Layout from "../../../components/layout";
import DeleteModal from "../../../components/modals/DeleteModal";
import { invitedMembersConfig } from "../../../constants/index";
import {
  deleteInvitation,
  listInvitations,
} from "../../../redux/slices/invitations";

const InvitedMembers = ({ onSubmit }) => {
  const dispatch = useDispatch();
  const workspaceId = Cookies.get("workspaceId");

  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!workspaceId) {
          console.error("Workspace ID is not available.");
          return;
        }

        setIsLoading(true);

        const result = await dispatch(listInvitations(workspaceId)).unwrap();

        const formattedData = result.map((invitation) => ({
          id: invitation.id,
          token: invitation.token,
          email: invitation.inviteeEmail,
          status: invitation.status,
          generated: new Date(invitation.createdAt).toLocaleString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          accepted: invitation.usedAt
            ? new Date(invitation.usedAt).toLocaleString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
            : "--",
          expire: new Date(invitation.expiresAt).toLocaleString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
        }));

        setTeamMembers(formattedData);
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dispatch, workspaceId]);

  // Delete Modal Handler
  const handleDelete = (member) => {
    setSelectedMember(member);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedMember) return;

    console.log(selectedMember);

    try {
      setIsLoading(true);

      await dispatch(
        deleteInvitation({
          invitationId: selectedMember.id,
          workspaceId,
        })
      ).unwrap();

      cogoToast.success("Invitation deleted successfully!");

      setTeamMembers((prevMembers) =>
        prevMembers.filter((member) => member.id !== selectedMember.id)
      );
    } catch (err) {
      cogoToast.error(err?.message || "Failed to delete invitation.");
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  const updatedinvitedMembersConfig = {
    ...invitedMembersConfig,
    actions: invitedMembersConfig.actions.map((action) => {
      if (action.tooltip === "Delete") {
        return { ...action, onClick: handleDelete };
      }
      return action;
    }),
  };

  return (
    <Layout onSubmit={onSubmit}>
      <div className="p-2">
        {isLoading ? (
          <div className="flex h-screen flex-col text-center p-6">
            <div className="absolute inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-custom-main border-t-transparent"></div>
            </div>
          </div>
        ) : (
          <GenericTable {...updatedinvitedMembersConfig} data={teamMembers} />
        )}
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        title={selectedMember?.name || "this invitation"}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </Layout>
  );
};

export default InvitedMembers;
