import cogoToast from "@successtar/cogo-toast";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { createPlan } from "../../../redux/slices/plans";
import InputField from "../../input-field/InputField";

const AddSubscriptionModal = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    features: {
      Structures: "50",
      "Dynamic WBS": false,
      "Record Tagging": false,
      "Import from Excel": true,
      "Rich Text Records": true,
      "Export to HTML/Markdown": true,
      "Structure Backup/Restore": true,
      "Interactive structure map": true,
      "Export to DOC/PDF": false,
    },
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFeatureToggle = (feature) => {
    setFormData((prev) => ({
      ...prev,
      features: { ...prev.features, [feature]: !prev.features[feature] },
    }));
  };

  const handleDropdownChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      features: { ...prev.features, Structures: e.target.value },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createPlan(formData))
      .unwrap()
      .then(() => {
        cogoToast.success("Plan created successfully!");
        onClose();
        onSuccess();
      })
      .catch((error) => {
        cogoToast.error(error || "Failed to create plan");
      });
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl shadow-lg p-6 w-[600px] h-full max-h-[70%] overflow-scroll">
        <h2 className="mb-2 text-3xl font-bold text-gray-800">
          Add Subscription Plan
        </h2>
        <h3 className="text-base text-gray-500 mb-6">
          Add the details to create a new subscription plan.
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Plan Name"
            placeholder="Enter plan name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <InputField
            label="Description"
            placeholder="Enter description"
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
          <InputField
            label="Price ($)"
            placeholder="Enter price"
            name="price"
            value={formData.price}
            onChange={handleChange}
          />

          <div>
            <h3 className="text-lg font-semibold mb-2">Features</h3>
            <div className="mb-4">
              <label className="block text-base font-medium text-gray-600 mb-1">
                Structures
              </label>
              <select
                value={formData.features.Structures}
                onChange={handleDropdownChange}
                className="block w-full p-2 border-2 border-gray-300 rounded-md focus:ring-custom-main focus:border-custom-main"
              >
                <option value="10">10</option>
                <option value="50">50</option>
                <option value="Unlimited">Unlimited</option>
              </select>
            </div>
            {Object.keys(formData.features).map(
              (feature) =>
                feature !== "Structures" && (
                  <div key={feature} className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      checked={formData.features[feature]}
                      onChange={() => handleFeatureToggle(feature)}
                      className="w-4 h-4 text-custom-main border-custom-main focus:ring-custom-main"
                    />
                    <label className="text-base text-gray-600">{feature}</label>
                  </div>
                )
            )}
          </div>

          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              className="py-2 px-4 rounded-md bg-gray-600 text-white hover:bg-gray-500 transition"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 rounded-md bg-custom-main text-white hover:bg-red-800 transition"
            >
              Save Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSubscriptionModal;
