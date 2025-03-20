import cogoToast from "@successtar/cogo-toast";
import React, { useCallback, useEffect, useState } from "react";
import { FaRocket } from "react-icons/fa";
import { IoTrash } from "react-icons/io5";
import { MdAddTask } from "react-icons/md";
import { TbEditCircle } from "react-icons/tb";
import { useDispatch } from "react-redux";
import AdminLayout from "../../../components/admin/admin-layout";
import AddSubscriptionModal from "../../../components/admin/modals/AddSubcriptionModal";
import EditSubscriptionModal from "../../../components/admin/modals/EditSubscriptionModal";
import DeleteModal from "../../../components/modals/DeleteModal";
import Tooltip from "../../../components/tooltip/Tooltip";
import {
  deletePlan,
  fetchPlans,
  updatePlan,
} from "../../../redux/slices/plans";

const SubscriptionTable = () => {
  const dispatch = useDispatch();
  const [tableData, setTableData] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPlansData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await dispatch(fetchPlans()).unwrap();
      setTableData(data);
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchPlansData();
  }, [fetchPlansData]);

  const headers = ["Plan Name", "Description", "Price", "Status", "Actions"];

  // Function to remove the plan from local state
  const handleDelete = (id) => {
    setTableData((prevData) => prevData.filter((item) => item.id !== id));
    cogoToast.success("Plan deleted successfully!");
  };

  // Toggle status API call
  const toggleUserStatus = (id) => {
    const plan = tableData.find((p) => p.id === id);
    if (!plan) return;

    const newStatus = plan.status === "active" ? "inactive" : "active";

    dispatch(updatePlan({ id, updatePlanDto: { status: newStatus } }))
      .unwrap()
      .then((updatedPlan) => {
        setTableData((prevData) =>
          prevData.map((p) => (p.id === id ? updatedPlan : p))
        );
        cogoToast.success("Plan status updated successfully!");
      })
      .catch((error) => {
        cogoToast.error("Failed to update plan status");
      });
  };

  // Open the delete modal with the selected plan
  const openDeleteModal = (plan) => {
    setSelectedPlan(plan);
    setDeleteModalOpen(true);
  };

  // Close modal and reset selected plan
  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedPlan(null);
  };

  const handleAddPlan = (newPlan) => {
    setTableData([...tableData, newPlan]);
    cogoToast.success("Plan added successfully!");
    setAddModalOpen(false);
  };

  const handleEditPlan = (updatedPlan) => {
    setTableData((prevData) =>
      prevData.map((plan) => (plan.id === updatedPlan.id ? updatedPlan : plan))
    );
    cogoToast.success("Plan updated successfully!");
  };

  const confirmDelete = () => {
    if (selectedPlan) {
      dispatch(deletePlan(selectedPlan.id))
        .unwrap()
        .then(() => {
          setTableData((prevData) =>
            prevData.filter((item) => item.id !== selectedPlan.id)
          );
          cogoToast.success("Plan deleted successfully!");
          closeDeleteModal();
        })
        .catch((error) => {
          if (error?.status === 400) {
            cogoToast.error("Cannot delete plan: Bad request.");
          } else {
            cogoToast.error(error?.message || "Failed to delete plan");
          }
        });
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

  if (tableData.length === 0) {
    return (
      <AdminLayout>
        <div className="flex h-screen flex-col items-center justify-center text-center p-6">
          <div className="flex items-center justify-center bg-white text-custom-main rounded-full w-28 h-28 mb-4">
            <FaRocket className="text-5xl text-custom-main" />
          </div>
          <h2 className="text-2xl font-bold text-custom-text-grey mb-2">
            No subscription plans found
          </h2>
          <p className="text-lg text-custom-text-grey mb-4">
            There are no subscription plans to display at the moment. <br />{" "}
            Please add a new subscription plan.
          </p>
          <button className="flex items-center border-2 border-custom-main gap-2 px-5 py-2 text-custom-main hover:bg-custom-main hover:text-white rounded-md transition">
            <MdAddTask size={20} />
            Add Plan
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
            <h2 className="text-3xl font-semibold text-gray-800">
              Subscription Plans
            </h2>
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-custom-main rounded-lg shadow-md hover:bg-gray-300 transition"
                onClick={() => setAddModalOpen(true)}
              >
                <MdAddTask size={20} />
                Add Plan
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
              {tableData.map((plan) => (
                <tr key={plan.id} className="border-b border-gray-100">
                  <td className="px-5 py-4 text-gray-500">{plan.name}</td>
                  <td className="px-5 py-4 text-gray-500">
                    {plan.description}
                  </td>
                  <td className="px-4 py-3 text-gray-500">$ {plan.price}.00</td>
                  <td className="px-4 py-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={plan.status === "active"}
                        onChange={() => toggleUserStatus(plan.id)}
                        className="sr-only peer"
                      />
                      <div
                        className={`w-12 h-6 rounded-full transition-all ${
                          plan.status === "active"
                            ? "bg-custom-main"
                            : "bg-gray-300"
                        }`}
                      ></div>
                      <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white border border-gray-600 rounded-full peer-checked:translate-x-6 transition-transform"></div>
                    </label>
                  </td>
                  <td className="px-2 py-2 flex">
                    <Tooltip label="Edit">
                      <button
                        className="p-2 text-black rounded transition"
                        onClick={() => {
                          setSelectedPlan(plan);
                          setEditModalOpen(true);
                        }}
                      >
                        <TbEditCircle className="w-6 h-6" />
                      </button>
                    </Tooltip>
                    <Tooltip label="Delete">
                      <button
                        className="p-2 text-red-500 rounded transition"
                        onClick={() => openDeleteModal(plan)}
                      >
                        <IoTrash className="w-5 h-5" />
                      </button>
                    </Tooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <AddSubscriptionModal
            isOpen={addModalOpen}
            onClose={() => setAddModalOpen(false)}
            onSubmit={handleAddPlan}
            onSuccess={fetchPlansData}
            title="Add Subscription Plan"
          />
          <EditSubscriptionModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            onSubmit={handleEditPlan}
            onSuccess={fetchPlansData}
            plan={selectedPlan}
            title="Edit Subscription Plan"
          />
          <DeleteModal
            isOpen={deleteModalOpen}
            onClose={closeDeleteModal}
            onConfirm={confirmDelete}
            title={selectedPlan?.name}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default SubscriptionTable;
