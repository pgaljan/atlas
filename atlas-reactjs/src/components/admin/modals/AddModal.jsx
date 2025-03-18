import React, { useState } from "react";
import InputField from "../../../components/input-field/InputField";
import Select from "react-select";

const AddModal = ({ isOpen, onClose, onSubmit, title = "User" }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  // Define role options for the select dropdown
  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "super-admin", label: "Super Admin" },
    { value: "user", label: "User" },
  ];

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (selectedOption) => {
    setFormData({ ...formData, role: selectedOption.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-end z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 h-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Add {title}</h2>
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
          <InputField
            label="Password"
            placeholder="Enter password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
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
              Save {title}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddModal;
