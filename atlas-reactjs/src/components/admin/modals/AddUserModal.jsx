import React, { useState } from "react";
import InputField from "../../input-field/InputField";
import Select from "react-select";

const AddUserModal = ({ isOpen, onClose, onSubmit, title = "User" }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "",
    password: "",
  });

  const roleOptions = [
    { value: "admin", label: "Admin" },
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
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl shadow-lg p-6 w-[600px]">
        <h4 className="mb-2 text-3xl font-bold text-gray-800">Add {title}</h4>
        <p className="text-base text-gray-500 mb-6">
          Enter {title} details to add a new {title}.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Full Name"
            placeholder="Enter full name"
            type="text"
            name="fullName"
            value={formData.fullName}
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

export default AddUserModal;
