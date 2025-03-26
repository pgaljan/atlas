import React, { useState, useEffect } from "react";
import InputField from "../../input-field/InputField";
import Select from "react-select";
import { useDispatch } from "react-redux";
import { fetchRoles } from "../../../redux/slices/roles";

const GenericModal = ({
  isOpen,
  onClose,
  onSubmit,
  type,
  title,
  initialData,
}) => {
  const defaultUserData = {
    fullName: "",
    username: "",
    email: "",
    role: "",
    password: "",
  };

  const [formData, setFormData] = useState(
    initialData || (type === "user" ? defaultUserData : {})
  );

  // Local state to store roles and their loading/error status.
  const [roleOptions, setRoleOptions] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    if (type === "user") {
      setRolesLoading(true);
      dispatch(fetchRoles())
        .unwrap()
        .then((roles) => {
          const options = roles.map((role) => ({
            value: role.id,
            label: role.name,
          }));
          setRoleOptions(options);
          setRolesLoading(false);
        })
        .catch((error) => {
          setRolesError(error);
          setRolesLoading(false);
        });
    }
  }, [dispatch, type]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else if (type === "user") {
      setFormData(defaultUserData);
    }
  }, [initialData, type]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-end z-50">
      <div className="bg-white rounded-3xl shadow-lg p-6 w-[400px] h-full overflow-auto relative">
        <h4 className="mb-2 text-3xl font-bold text-gray-800">{title}</h4>
        <p className="text-base text-gray-500 mb-3">
          Please provide the user details below:
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Full Name"
            name="fullName"
            placeholder="Enter full name"
            value={formData.fullName}
            onChange={handleChange}
          />
          <InputField
            label="Username"
            name="username"
            placeholder="Enter username"
            value={formData.username}
            onChange={handleChange}
          />
          <InputField
            label="Email"
            name="email"
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={handleChange}
          />
          <div>
            <label className="block text-gray-700 font-medium mb-2">Role</label>
            {rolesLoading ? (
              <p>Loading roles...</p>
            ) : rolesError ? (
              <p className="text-red-500">Failed to load roles</p>
            ) : (
              <Select
                placeholder="Select Role"
                options={roleOptions}
                onChange={handleRoleChange}
                value={roleOptions.find(
                  (option) =>
                    option.value ===
                    (typeof formData.role === "object"
                      ? formData.role.id
                      : formData.role)
                )}
              />
            )}
          </div>
          <InputField
            label="Password"
            name="password"
            type="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
          />

          <div className="flex justify-end gap-4 pt-12">
            <button
              type="button"
              className="py-2 px-4 rounded-md bg-gray-600 text-white"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 rounded-md bg-custom-main text-white"
            >
              Save {title}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenericModal;
