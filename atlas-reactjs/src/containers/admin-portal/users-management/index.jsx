import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { MdGroupAdd, MdOutlineDownloading } from "react-icons/md";
import { TbEditCircle } from "react-icons/tb";
import { IoTrash } from "react-icons/io5";
import AdminLayout from "../../../components/admin/admin-layout";
import InputField from "../../../components/input-field/InputField";
import Modal from "../../../components/modals/AdminModal";
import DeleteModal from "../../../components/modals/DeleteModal";
import Tooltip from "../../../components/tooltip/Tooltip";
import cogoToast from "@successtar/cogo-toast";
import { registerUser } from "../../../redux/slices/auth";
import {
  exportUsers,
  fetchAllUsers,
  updateUser,
  deleteUser,
} from "../../../redux/slices/users";

const UserTable = () => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Local state for add/edit form fields
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [role, setRole] = useState("");

  // State to track if we're editing; if null, we're adding
  const [editingUser, setEditingUser] = useState(null);

  // Delete modal states (store full user object)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Open add/edit modal; if a user is passed, prefill for editing
  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFullName(user.fullName || "");
      setUsername(user.username || "");
      setUserEmail(user.email || "");
      setUserPassword(""); // leave password empty for security reasons
      setRole(user.role?.name || "");
    } else {
      setEditingUser(null);
      setFullName("");
      setUsername("");
      setUserEmail("");
      setUserPassword("");
      setRole("");
    }
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingUser(null);
    setFullName("");
    setUsername("");
    setUserEmail("");
    setUserPassword("");
    setRole("");
  };

  // Open delete modal and store the full user object
  const openDeleteModal = (user) => {
    console.log(user.id);
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setUserToDelete(null);
    setIsDeleteModalOpen(false);
  };

  // Fetch all users on mount and after any changes
  useEffect(() => {
    setLoading(true);
    dispatch(fetchAllUsers())
      .unwrap()
      .then((users) => {
        setTableData(users);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch users:", error);
        setLoading(false);
      });
  }, [dispatch]);

  const headers = ["User", "Email", "Role", "Status", "Actions"];

  const toggleUserStatus = (id) => {
    setTableData((prevData) =>
      prevData.map((user) =>
        user.id === id
          ? {
              ...user,
              status: user.status === "active" ? "inactive" : "active",
            }
          : user
      )
    );
  };

  const handleExportUsers = () => {
    dispatch(exportUsers())
      .unwrap()
      .then((buffer) => {
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "users.xlsx";
        a.click();
        window.URL.revokeObjectURL(url);
        cogoToast.success("Export successful");
      })
      .catch((error) => {
        cogoToast.error("Failed to export users");
      });
  };

  // For adding a new user
  const handleSaveUser = async () => {
    const registerData = {
      fullName,
      username,
      email: userEmail,
      password: userPassword,
      role,
    };

    try {
      await dispatch(registerUser(registerData)).unwrap();
      cogoToast.success("User registered successfully!");
      closeModal();
      dispatch(fetchAllUsers())
        .unwrap()
        .then((users) => setTableData(users));
    } catch (error) {
      cogoToast.error(error.message || "Failed to register user");
    }
  };

  // For updating an existing user
  const handleUpdateUser = async () => {
    const updateData = {
      fullName,
      username,
      email: userEmail,
      role,
      ...(userPassword && { password: userPassword }),
    };

    try {
      await dispatch(
        updateUser({ userId: editingUser.id, updateData })
      ).unwrap();
      cogoToast.success("User updated successfully!");
      closeModal();
      dispatch(fetchAllUsers())
        .unwrap()
        .then((users) => setTableData(users));
    } catch (error) {
      cogoToast.error(error.message || "Failed to update user");
    }
  };

  // For deleting a user
  const handleDeleteUser = async () => {
    try {
      console.log(userToDelete);
      await dispatch(deleteUser(userToDelete.id)).unwrap();
      cogoToast.success("User deleted successfully!");
      closeDeleteModal();
      dispatch(fetchAllUsers())
        .unwrap()
        .then((users) => setTableData(users));
    } catch (error) {
      console.log(error);
      cogoToast.error(error.message || "Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen flex-col text-center p-6">
        <div className="absolute inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-custom-main border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-2">
        <div className="p-10 rounded-[18px] bg-custom-background-white h-auto max-h-[90%] shadow-md">
          <div className="mb-6 flex justify-between w-full items-center">
            <h2 className="text-3xl font-semibold text-gray-800">User</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportUsers}
                className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-custom-main text-white rounded-lg shadow-md hover:bg-custom-dark transition"
              >
                <MdOutlineDownloading size={20} />
                Export Users
              </button>
              <button
                onClick={() => openModal()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-custom-main rounded-lg shadow-md hover:bg-gray-300 transition"
              >
                <MdGroupAdd size={20} />
                Add User
              </button>
            </div>
          </div>

          {/* Add/Edit Modal */}
          <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[800px]">
            <div className="no-scrollbar relative w-[600px] overflow-y-auto rounded-3xl bg-white p-6">
              <div className="px-2 pr-14">
                <h4 className="mb-2 text-3xl font-bold text-gray-800">
                  {editingUser ? "Edit User" : "Add User"}
                </h4>
                <p className="text-base text-gray-500 mb-6">
                  {editingUser
                    ? "Update user details."
                    : "Enter user details to add a new user."}
                </p>
              </div>
              <div className="flex flex-col custom-scrollbar overflow-y-auto px-2 space-y-5">
                <InputField
                  label="Full Name"
                  placeholder="Enter name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full"
                />
                <InputField
                  label="Username"
                  placeholder="Enter username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full"
                />
                <InputField
                  label="Email Address"
                  type="email"
                  placeholder="Enter your working email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full"
                />
                <InputField
                  label="Password"
                  type="password"
                  placeholder={
                    editingUser
                      ? "Enter new password (optional)"
                      : "Enter your password"
                  }
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  className="w-full"
                />
                <InputField
                  label="Role"
                  placeholder="Enter user role"
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex items-center gap-3 px-2 justify-end mt-8">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-base font-medium text-white rounded-md bg-gray-600 hover:bg-gray-500"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={editingUser ? handleUpdateUser : handleSaveUser}
                  className="px-4 py-2 text-base font-medium text-white rounded-md bg-custom-main hover:bg-red-800"
                >
                  {editingUser ? "Update User" : "Save User"}
                </button>
              </div>
            </div>
          </Modal>

          {/* Delete Modal */}
          <DeleteModal
            isOpen={isDeleteModalOpen}
            onClose={closeDeleteModal}
            onConfirm={handleDeleteUser}
            title={
              userToDelete
                ? userToDelete.fullName || userToDelete.username
                : "User"
            }
          />

          <table className="p-10 w-full">
            <thead className="border-b border-gray-100">
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="px-5 py-3 text-left border-b text-black-100"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((user) => (
                <tr key={user.id} className="border-b border-gray-100">
                  <td className="px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <img
                        className="w-10 h-10 rounded-full"
                        src={user.image || "/assets/userimg.jpeg"}
                        alt={user.username}
                      />
                      <div>
                        <p className="text-gray-600 font-medium">
                          {user.fullName}
                        </p>
                        <p className="text-gray-500 text-sm italic">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{user.email}</td>
                  <td className="px-4 py-3 capitalize text-gray-500">
                    {user.role?.name}
                  </td>
                  <td className="px-4 py-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={user.status === "active"}
                        onChange={() => toggleUserStatus(user.id)}
                        className="sr-only peer"
                      />
                      <div
                        className={`w-12 h-6 rounded-full transition-all ${
                          user.status === "active"
                            ? "bg-custom-main"
                            : "bg-gray-300"
                        }`}
                      ></div>
                      <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white border border-gray-600 rounded-full peer-checked:translate-x-6 transition-transform`}
                      ></div>
                    </label>
                  </td>
                  <td className="px-2 py-2 flex">
                    <Tooltip label="Edit">
                      <button
                        onClick={() => openModal(user)}
                        className="p-2 text-custom-main rounded transition hover:text-green-600"
                      >
                        <TbEditCircle className="w-5 h-5" />
                      </button>
                    </Tooltip>
                    <Tooltip label="Delete">
                      <button
                        onClick={() => openDeleteModal(user)}
                        className="p-2 text-red-500 rounded transition hover:text-red-600"
                      >
                        <IoTrash className="w-5 h-5" />
                      </button>
                    </Tooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserTable;
