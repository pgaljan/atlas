import cogoToast from "@successtar/cogo-toast";
import React, { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { IoTrash } from "react-icons/io5";
import { MdGroupAdd, MdOutlineDownloading } from "react-icons/md";
import { TbEditCircle } from "react-icons/tb";
import { useDispatch } from "react-redux";
import AdminLayout from "../../../components/admin/admin-layout";
import GenericModal from "../../../components/admin/modals/GenericModal";
import DeleteModal from "../../../components/modals/DeleteModal";
import Tooltip from "../../../components/tooltip/Tooltip";
import useOutsideClick from "../../../hooks/useOutsideClick";
import { registerUser } from "../../../redux/slices/auth";
import {
  deleteUser,
  exportUsers,
  fetchAllUsers,
  updateUser,
} from "../../../redux/slices/users";

const index = () => {
  const dispatch = useDispatch();
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Sort");
  const options = [
    "Personal",
    "Analyst",
    "Business",
    "Educator",
    "User",
    "Admin",
  ];
  const sortRef = useOutsideClick(() => setIsSortOpen(false));
  const [editingUser, setEditingUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // New states for filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState(false);

  const openModal = (user = null) => {
    setEditingUser(user);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingUser(null);
  };

  const handleSelect = (option) => {
    setSelectedOption(option);
    setIsSortOpen(false);
  };

  // Open delete modal
  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setUserToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const fetchUsersData = async () => {
    setLoading(true);
    try {
      const users = await dispatch(fetchAllUsers()).unwrap();
      const sortedUsers = [...users].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setTableData(sortedUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, [dispatch]);

  const headers = [
    "User",
    "Email",
    "Role",
    "Admin",
    "Status",
    "Invites",
    "Actions",
  ];

  const toggleUserStatus = async (id) => {
    const user = tableData.find((u) => u.id === id);
    if (!user) return;

    const newStatus = user.status === "active" ? "inactive" : "active";

    try {
      await dispatch(
        updateUser({ userId: id, updateData: { status: newStatus } })
      ).unwrap();
      cogoToast.success("User status updated successfully!");
      setTableData((prevData) =>
        prevData.map((user) =>
          user.id === id ? { ...user, status: newStatus } : user
        )
      );
    } catch (error) {
      cogoToast.error(error.message || "Failed to update user status");
    }
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

  const handleSaveUser = async (data) => {
    try {
      await dispatch(registerUser(data)).unwrap();
      cogoToast.success("User registered successfully!");
      closeModal();
      fetchUsersData();
    } catch (error) {
      cogoToast.error(error.message || "Failed to register user");
    }
  };

  const handleUpdateUser = async (data) => {
    const updateData = {
      fullName: data.fullName,
      username: data.username,
      email: data.email,
      role: data.role,
      ...(data.password && { password: data.password }),
    };

    try {
      await dispatch(
        updateUser({ userId: editingUser.id, updateData })
      ).unwrap();
      cogoToast.success("User updated successfully!");
      closeModal();
      fetchUsersData();
    } catch (error) {
      cogoToast.error(error.message || "Failed to update user");
    }
  };

  // For deleting a user
  const handleDeleteUser = async () => {
    try {
      await dispatch(
        deleteUser({
          userId: userToDelete.id,
          reason: "Deleted by Super Admin",
        })
      ).unwrap();

      cogoToast.success("User deleted successfully!");
      closeDeleteModal();
      fetchUsersData();
    } catch (error) {
      cogoToast.error(error.message || "Failed to delete user");
    }
  };

  const toggleAdminStatus = async (id) => {
    const user = tableData.find((u) => u.id === id);
    if (!user) return;

    try {
      const updatedUser = await dispatch(
        updateUser({ userId: id, updateData: { isAdmin: !user.isAdmin } })
      ).unwrap();
      setTableData((prevData) =>
        prevData.map((u) => (u.id === id ? updatedUser : u))
      );
      fetchUsersData();
      cogoToast.success("User admin status updated successfully!");
    } catch (error) {
      cogoToast.error(error.message || "Failed to update admin status");
    }
  };

  const handleInviteUpdate = async (id, newCount) => {
    const inviteCount = Number(newCount);
    try {
      const updatedUser = await dispatch(
        updateUser({ userId: id, updateData: { inviteCount } })
      ).unwrap();
      setTableData((prevData) =>
        prevData.map((u) => (u.id === id ? updatedUser : u))
      );
      cogoToast.success("Invite count updated successfully!");
    } catch (error) {
      cogoToast.error(error.message || "Failed to update invites");
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

  // Prepare initial data for the modal.
  const initialModalData = editingUser
    ? {
        fullName: editingUser.fullName || "",
        username: editingUser.username || "",
        email: editingUser.email || "",
        role: editingUser.role?.name || "",
        password: "",
      }
    : undefined;

  // Filter table data based on search term and status checkbox
  const filteredUsers = tableData.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      user.fullName?.toLowerCase().includes(searchLower) ||
      user.username?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower);
    const matchesStatus = filterActive ? user.status === "active" : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="p-2">
        <div className="p-10 rounded-[18px] bg-custom-background-white h-auto max-h-[90%] shadow-md">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between w-full">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4 sm:mb-0">
              Users
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Search Box */}
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 w-64 focus:outline-none focus:border-custom-main"
                />
              </div>
              {/* Status Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterActive}
                  onChange={() => setFilterActive((prev) => !prev)}
                  className="form-checkbox h-5 w-5 text-custom-main"
                />
                <span className="text-gray-700">Active Only</span>
              </label>

              {/* Sort Dropdown */}
              <div className="relative z-20" ref={sortRef}>
                <button
                  className="flex items-center justify-between w-36 px-4 py-2 bg-gray-200 text-custom-main rounded-lg shadow-md hover:bg-gray-300 focus:border-custom-main transition"
                  onClick={() => setIsSortOpen(!isSortOpen)}
                >
                  {selectedOption}
                  <FaChevronDown className="text-gray-500 ml-2" />
                </button>
                {isSortOpen && (
                  <ul className="absolute left-0 w-36 mt-1 bg-white border border-gray-300 rounded-lg shadow-md">
                    {options.map((option) => (
                      <li
                        key={option}
                        className="px-4 py-2 text-black hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSelect(option)}
                      >
                        {option}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Export Users Button */}
              <button
                onClick={handleExportUsers}
                className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-custom-main text-white rounded-lg shadow-md hover:bg-custom-dark transition"
              >
                <MdOutlineDownloading size={20} />
                Export Users
              </button>
              {/* Add User Button */}
              <button
                onClick={() => openModal()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-custom-main rounded-lg shadow-md hover:bg-gray-300 transition"
              >
                <MdGroupAdd size={20} />
              </button>
            </div>
          </div>

          <GenericModal
            isOpen={isOpen}
            onClose={closeModal}
            onSubmit={editingUser ? handleUpdateUser : handleSaveUser}
            type="user"
            title={editingUser ? "Edit User" : "Add User"}
            initialData={initialModalData}
          />

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
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={headers.length} className="text-center py-4">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
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
                          checked={user.isAdmin === true}
                          onChange={() => toggleAdminStatus(user.id)}
                          className="sr-only peer"
                        />
                        <div
                          className={`w-12 h-6 rounded-full transition-all ${
                            user.isAdmin === true
                              ? "bg-custom-main"
                              : "bg-gray-300"
                          }`}
                        ></div>
                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white border border-gray-600 rounded-full peer-checked:translate-x-6 transition-transform"></div>
                      </label>
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
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        defaultValue={user.inviteCount || 0}
                        onBlur={(e) =>
                          handleInviteUpdate(user.id, e.target.value)
                        }
                        className="border-2 border-gray-300 rounded px-2 py-1 text-sm w-20 focus:border-custom-main focus:outline-none"
                      />
                    </td>
                    <td className="px-2 py-2 flex mt-2">
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default index;
