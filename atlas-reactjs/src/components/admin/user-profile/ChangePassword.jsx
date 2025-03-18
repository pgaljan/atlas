import useModal from "../../../hooks/useModal";
import Modal from "../../modals/AdminModal";
import InputField from "../../input-field/InputField";
import { TbEditCircle } from "react-icons/tb";
import { useState } from "react";
import { IoTrash } from "react-icons/io5";

const ChangePasswordCard = () => {
  const {
    isOpen: isChangePasswordOpen,
    openModal: openChangePasswordModal,
    closeModal: closeChangePasswordModal,
  } = useModal();

  const {
    isOpen: isDeleteAccountOpen,
    openModal: openDeleteAccountModal,
    closeModal: closeDeleteAccountModal,
  } = useModal();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSave = () => {
    console.log("Saving changes...");
    closeChangePasswordModal();
  };

  return (
    <div className="p-5 border-2 border-gray-200 rounded-2xl ">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h4 className="text-xl font-bold text-gray-800">Change Password</h4>
          <button
            onClick={openChangePasswordModal}
            className="flex w-auto lg:w-auto items-center justify-center gap-1 rounded-lg  bg-custom-main px-3 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-red-800"
          >
            <TbEditCircle className="w-5 h-4" /> Edit
          </button>
        </div>

        <div className="flex items-center justify-between">
          <h4 className="text-xl font-bold text-red-600">Delete Account</h4>
          <button
            onClick={openDeleteAccountModal}
            className="flex w-auto lg:w-auto items-center justify-center gap-1 rounded-lg  bg-red-600 px-3 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-red-800"
          >
            <IoTrash className="w-5 h-4" /> Delete
          </button>
        </div>
      </div>

      <Modal
        isOpen={isChangePasswordOpen}
        onClose={closeChangePasswordModal}
        className="max-w-[600px]"
      >
        <div className="relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-6">
          <h4 className="text-3xl mb-2 font-bold text-gray-800">
            Change Password
          </h4>
          <p className="text-base  text-gray-500 mb-2">
            Update your password to keep your account secure.
          </p>
          <form className="flex flex-col">
            <div className="grid grid-cols-1 gap-y-5 mt-7">
              <InputField
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <InputField
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <InputField
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 justify-end mt-8">
              <button
                type="button"
                onClick={closeChangePasswordModal}
                className="px-4 py-2 text-base font-medium text-white rounded-md bg-gray-600 hover:bg-gray-500"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 text-base font-medium text-white rounded-md bg-custom-main hover:bg-red-800"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteAccountOpen}
        onClose={closeDeleteAccountModal}
        className="max-w-[600px]"
      >
        <div className="relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-6">
          <h4 className="text-3xl mb-4 font-bold text-gray-800">
            Delete Account
          </h4>
          <p className="text-base text-gray-500 mb-2">
            Are you sure you want to delete your account? This action cannot be
            undone.
          </p>
          <div className="flex items-center gap-3 justify-end mt-8">
            <button
              type="button"
              onClick={closeDeleteAccountModal}
              className="px-4 py-2 text-base font-medium text-white rounded-md bg-gray-600 hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={closeDeleteAccountModal}
              className="px-4 py-2 text-base font-medium text-white rounded-md bg-custom-main hover:bg-red-800"
            >
              Delete Account
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChangePasswordCard;
