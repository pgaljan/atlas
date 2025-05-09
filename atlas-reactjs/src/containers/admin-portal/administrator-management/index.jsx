import cogoToast from "@successtar/cogo-toast";
import React, { useEffect, useState } from "react";
import { ImUserPlus } from "react-icons/im";
import { IoTrash } from "react-icons/io5";
import { TbEditCircle } from "react-icons/tb";
import { VscLink } from "react-icons/vsc";
import { useDispatch } from "react-redux";
import AdminLayout from "../../../components/admin/admin-layout";
import AddUserModal from "../../../components/admin/modals/AddUserModal";
import UpdateAdminModal from "../../../components/admin/modals/UpdateAdminModal"; 
import DeleteModal from "../../../components/modals/DeleteModal";
import Tooltip from "../../../components/tooltip/Tooltip";
import {
  deleteAdministrator,
  getAllAdministrators,
  registerAdministrator,
} from "../../../redux/slices/administrator-auth";

const AdministratorsTable = () => {
  const dispatch = useDispatch();

  // Modal states for adding, updating, and deletion
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedAdminForDelete, setSelectedAdminForDelete] = useState(null);
  const [adminToUpdate, setAdminToUpdate] = useState(null);

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  const openDeleteModal = (admin) => {
    setSelectedAdminForDelete(admin);
  };
  const closeDeleteModal = () => {
    setSelectedAdminForDelete(null);
  };

  const openUpdateModal = (admin) => {
    setAdminToUpdate(admin);
    setIsUpdateModalOpen(true);
  };
  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setAdminToUpdate(null);
  };

  // Local state for table data and loading
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all administrators on mount
  useEffect(() => {
    setLoading(true);
    dispatch(getAllAdministrators())
      .unwrap()
      .then((admins) => {
        setTableData(admins);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch administrators:", error);
        setLoading(false);
      });
  }, [dispatch]);

  const headers = ["Administrator", "Email", "Role", "Status", "Actions"];

  const handleDeleteAdmin = () => {
    if (selectedAdminForDelete) {
      dispatch(deleteAdministrator(selectedAdminForDelete.id))
        .unwrap()
        .then(() => {
          cogoToast.success("Administrator deleted successfully");
          setTableData((prevData) =>
            prevData.filter((admin) => admin.id !== selectedAdminForDelete.id)
          );
        })
        .catch((error) => {
          cogoToast.error(error || "Failed to delete administrator");
        });
    }
    closeDeleteModal();
  };

  const handleAddAdmin = (newAdminData) => {
    dispatch(registerAdministrator(newAdminData))
      .unwrap()
      .then((res) => {
        cogoToast.success(
          res.message || "Administrator registered successfully"
        );
        const newAdmin = {
          id: res.id,
          firstName: newAdminData.firstName,
          lastName: newAdminData.lastName,
          email: newAdminData.email,
          role: newAdminData.role,
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setTableData([...tableData, newAdmin]);
        closeAddModal();
      })
      .catch((error) => {
        cogoToast.error(error || "Failed to register administrator");
      });
  };

  // Toggle status between "active" and "inactive"
  const toggleAdminStatus = (id) => {
    setTableData((prevData) =>
      prevData.map((admin) =>
        admin.id === id
          ? {
              ...admin,
              status: admin.status === "active" ? "inactive" : "active",
            }
          : admin
      )
    );
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
        {tableData.length === 0 ? (
          <div className="flex h-screen flex-col items-center justify-center text-center p-6">
            <div className="flex items-center justify-center bg-white text-custom-main rounded-full w-28 h-28 mb-4">
              <ImUserPlus className="text-5xl text-custom-main" />
            </div>
            <h2 className="text-2xl font-bold text-custom-text-grey mb-2">
              No Administrators Found
            </h2>
            <p className="text-lg text-custom-text-grey mb-4">
              There are no administrators to display at the moment. <br />{" "}
              Please add new administrators.
            </p>
            <button
              onClick={openAddModal}
              className="flex items-center border-2 border-custom-main gap-2 px-5 py-2 text-custom-main hover:bg-custom-main hover:text-white rounded-md transition"
            >
              <ImUserPlus size={20} />
              Add Administrator
            </button>
          </div>
        ) : (
          <div className="p-10 rounded-[18px] bg-custom-background-white h-auto max-h-[90%] shadow-md">
            <div className="mb-6 flex justify-between w-full items-center">
              <h2 className="text-3xl font-semibold text-gray-800">
                Administrators
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={openAddModal}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-custom-main rounded-lg shadow-md hover:bg-gray-300 transition"
                >
                  <ImUserPlus size={20} />
                  Add Administrator
                </button>
              </div>
            </div>
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
                {tableData.map((admin) => (
                  <tr key={admin.id} className="border-b border-gray-100">
                    <td className="px-5 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <img
                          className="w-10 h-10 rounded-full"
                          src="/assets/userimg.jpeg"
                          alt={`${admin.firstName} ${admin.lastName}`}
                        />
                        <div>
                          <p className="text-gray-600 font-medium">
                            {admin.firstName} {admin.lastName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{admin.email}</td>
                    <td className="px-4 py-3 capitalize text-gray-500">
                      {admin.role || "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={admin.status === "active"}
                          onChange={() => toggleAdminStatus(admin.id)}
                          className="sr-only peer"
                        />
                        <div
                          className={`w-12 h-6 rounded-full transition-all ${
                            admin.status === "active"
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
                      <Tooltip label="Invite">
                        <button className="p-2 text-blue-500 rounded transition hover:text-blue-600">
                          <VscLink className="w-5 h-5" />
                        </button>
                      </Tooltip>
                      <Tooltip label="Edit">
                        <button
                          onClick={() => openUpdateModal(admin)} // Open update modal instead of add modal
                          className="p-2 text-custom-main rounded transition hover:text-green-600"
                        >
                          <TbEditCircle className="w-5 h-5" />
                        </button>
                      </Tooltip>
                      <Tooltip label="Delete">
                        <button
                          onClick={() => openDeleteModal(admin)}
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
        )}
        {/* Render the modals */}
        <AddUserModal
          isOpen={isAddModalOpen}
          onClose={closeAddModal}
          onSubmit={handleAddAdmin}
          title="Administrator"
        />
        <UpdateAdminModal
          isOpen={isUpdateModalOpen}
          onClose={closeUpdateModal}
          adminData={adminToUpdate}
        />
        <DeleteModal
          isOpen={!!selectedAdminForDelete}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteAdmin}
          title="Administrator"
        />
      </div>
    </AdminLayout>
  );
};

export default AdministratorsTable;
