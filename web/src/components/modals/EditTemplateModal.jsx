import cogoToast from "@successtar/cogo-toast";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { updateStructureTemplate } from "../../redux/slices/structure-templates";
import InputField from "../input-field/InputField";

const EditTemplateModal = ({
  isOpen,
  onClose,
  template,
  onSuccess,
  title = "Template",
}) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || "",
        description: template.description || "",
      });
    }
  }, [template]);

  if (!isOpen || !template) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return cogoToast.error("Template name is required.");
    }

    dispatch(
      updateStructureTemplate({
        id: template.id,
        data: {
          name: formData.name.trim(),
          description: formData.description?.trim() || "",
        },
      })
    )
      .unwrap()
      .then(() => {
        cogoToast.success("Template updated successfully!");
        onClose();
        onSuccess?.();
      })
      .catch((err) => {
        cogoToast.error(err.message || "Failed to update template.");
      });
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl shadow-lg p-6 w-[400px]">
        <h4 className="mb-2 text-3xl font-bold text-gray-800">Edit {title}</h4>
        <p className="text-base text-gray-500 mb-6">Update {title} details.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Template Name"
            placeholder="Enter template name"
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
              className="py-2 px-4 rounded-md bg-custom-main text-white hover:bg-custom-secondary"
            >
              Save {title}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTemplateModal;
