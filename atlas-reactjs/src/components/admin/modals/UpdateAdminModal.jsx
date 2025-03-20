import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateAdministratorProfile } from "../../../redux/slices/administrator-auth";
import InputField from "../../input-field/InputField";
import cogoToast from "@successtar/cogo-toast";
import Select from "react-select";

const UpdateAdminModal = ({ isOpen, onClose, adminData }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
  });

  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "super-admin", label: "Super Admin" },
    { value: "user", label: "User" },
  ];

  // Sync formData with adminData when it changes
  useEffect(() => {
    if (adminData) {
      setFormData({
        firstName: adminData.firstName || "",
        lastName: adminData.lastName || "",
        email: adminData.email || "",
        role: adminData.role || "",
      });
    }
  }, [adminData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (selectedOption) => {
    setFormData({ ...formData, role: selectedOption.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Dispatch the thunk with both the id and updateData
      await dispatch(
        updateAdministratorProfile({ id: adminData.id, updateData: formData })
      ).unwrap();
      cogoToast.success("Profile updated successfully");
      onClose();
    } catch (error) {
      cogoToast.error(error || "Failed to update profile");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl shadow-lg p-6 w-[600px]">
        <h4 className="mb-2 text-3xl font-bold text-gray-800">
          Update Profile
        </h4>
        <p className="text-base text-gray-500 mb-6">
          Modify administrator details below.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="First Name"
            placeholder="Enter first name"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />
          <InputField
            label="Last Name"
            placeholder="Enter last name"
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />
          <InputField
            label="Email Address"
            placeholder="Enter email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Role</label>
            <Select
              options={roleOptions}
              onChange={handleRoleChange}
              value={roleOptions.find(
                (option) => option.value === formData.role
              )}
              placeholder="Select role"
            />
          </div>
          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              className="py-2 px-4 rounded-md bg-gray-600 text-white hover:bg-gray-500"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 rounded-md bg-custom-main text-white hover:bg-red-800"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateAdminModal;
