import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { FaUserCheck } from "react-icons/fa";
import { MdGroupAdd, MdOutlineDownloading } from "react-icons/md";
import AdminLayout from "../../../components/admin/admin-layout";
import { exportUsers, fetchAllUsers } from "../../../redux/slices/users";
import cogoToast from "@successtar/cogo-toast";
import Tooltip from "../../../components/tooltip/Tooltip";
import { VscLink } from "react-icons/vsc";
import { TbEditCircle } from "react-icons/tb";
import { IoTrash } from "react-icons/io5";

const UserTable = () => {
  const dispatch = useDispatch();
  const [tableData, setTableData] = useState([]);

  // Fetch all users on component mount
  useEffect(() => {
    dispatch(fetchAllUsers())
      .unwrap()
      .then((users) => {
        setTableData(users);
      })
      .catch((error) => {
        console.error("Failed to fetch users:", error);
      });
  }, [dispatch]);

  const headers = ["User", "Email", "Role", "Status", "Actions"];

  // Toggle user status between "active" and "inactive"
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
        cogoToast.error("Faild to Export users");
      });
  };

  if (tableData.length === 0) {
    return (
      <AdminLayout>
        <div className="flex h-screen flex-col items-center justify-center text-center p-6">
          <div className="flex items-center justify-center bg-white text-custom-main rounded-full w-28 h-28 mb-4">
            <FaUserCheck className="text-5xl text-custom-main" />
          </div>
          <h2 className="text-2xl font-bold text-custom-text-grey mb-2">
            No Users Found
          </h2>
          <p className="text-lg text-custom-text-grey mb-4">
            There are no users to display at the moment. <br /> Please add new
            users.
          </p>

          <button className="flex items-center border-2 border-custom-main gap-2 px-5 py-2 text-custom-main hover:bg-custom-main hover:text-white rounded-md transition">
            <MdGroupAdd size={20} />
            Add User
          </button>
        </div>
      </AdminLayout>
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
              {tableData.map((user) => (
                <tr key={user.id} className="border-b border-gray-100">
                  <td className="px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <img
                        className="w-10 h-10 rounded-full"
                        // Use user.image if exists, else default image
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
                      <Tooltip label="Invite">
                        <button className="p-2 text-blue-500 rounded transition hover:text-blue-600">
                          <VscLink className="w-5 h-5" />
                        </button>
                      </Tooltip>
                      <Tooltip label="Edit">
                        <button className="p-2 text-custom-main rounded transition hover:text-green-600">
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
      </div>
    </AdminLayout>
  );
};

export default UserTable;
