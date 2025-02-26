import cogoToast from "@successtar/cogo-toast";
import { useEffect, useState } from "react";
import { BsTags } from "react-icons/bs";
import { IoTrash } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import useFeatureFlag from "../../hooks/useFeatureFlag";
import {
  createRecord,
  getRecordById,
  updateRecord,
} from "../../redux/slices/records";
import QuillEditor from "../editors/quillEditor";

const AddQuillModal = ({
  structureId,
  position,
  onClose,
  elementId,
  onSuccess,
  actionType,
  text,
  submitText,
  cancelText,
  recordId,
  fetchData,
}) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState({ metadata: "", tags: [] });
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState({
    metadata: "",
  });
  const [tags, setTags] = useState([]);
  const canTags = useFeatureFlag("Record Tagging");
  
  const handleFeatureClick = (canAccess, action) => {
    if (canAccess) {
      action();
    } else {
      navigate(`?plan=upgrade-to-premium`);
    }
  };

  useEffect(() => {
    if (actionType === "view" || (actionType === "edit" && recordId)) {
      dispatch(getRecordById(recordId))
        .unwrap()
        .then((record) => {
          if (record) {
            setFormData({ metadata: record.metadata.content });
            setTags(record.tags);
            setInitialData({
              metadata: record.metadata.content,
              tags: record.tags,
            });
          }
        })
        .catch((error) => {
          cogoToast.error(`Failed to fetch record: ${error.message}`);
        });
    }
  }, [actionType, recordId, dispatch]);

  useEffect(() => {
    const metadataChanged = formData.metadata !== initialData.metadata;
    const tagsChanged =
      JSON.stringify(tags) !== JSON.stringify(initialData.tags);
    setHasChanges(metadataChanged || tagsChanged);
  }, [formData, tags, initialData]);

  const handleEditorChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      metadata: value,
    }));
  };


const handleSave = async () => {
  if (!formData.metadata?.trim()) {
    cogoToast.error("Metadata is required!");
    return;
  }

  // Validate tags only if the user has added any
  if (tags.length > 0 && tags.some(tag => !tag.key.trim() || !tag.value.trim())) {
    cogoToast.error("Each tag must have both a key and a value.");
    return;
  }

  // Convert metadata to JSON
  const parsedMetadata = {
    content: formData.metadata,
  };

  const createRecordDto = {
    metadata: parsedMetadata,
    tags, // Include tags only if they exist
  };

  try {
    setIsLoading(true);
    if (actionType === "edit") {
      const updateRecordDto = {
        metadata: parsedMetadata,
        tags, // Ensure tags are also updated
      };
      await dispatch(updateRecord({ recordId, updateRecordDto })).unwrap();
      fetchData();
      cogoToast.success("Record updated successfully!");
    } else if (actionType === "add") {
      await dispatch(createRecord({ elementId, createRecordDto })).unwrap();
      fetchData();
      cogoToast.success("Record created successfully!");
    }
    onSuccess();
    onClose();
  } catch (error) {
    cogoToast.error(`Error saving record: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};

  

  const addTag = () => {
    setTags((prev) => [...prev, { key: "", value: "", id: Date.now() }]);
  };

  const handleTagChange = (id, field, value) => {
    setTags((prev) =>
      prev.map((tag) => (tag.id === id ? { ...tag, [field]: value } : tag))
    );
  };

  const deleteTag = (id) => {
    setTags((prev) => prev.filter((tag) => tag.id !== id));
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50"></div>

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          left: position.x,
          top: position.y,
          transform: "translate(-50%, -50%)",
        }}
        className="bg-white border border-gray-300 rounded-lg shadow-lg w-[850px] z-50"
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-t-lg border-b border-gray-300">
          <h2 className="text-xl font-semibold text-gray-800">{text} Record</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ✖
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 overflow-y-auto">
          <label className="block text-sm font-medium text-gray-700">
            Metadata
          </label>
          <div>
            <QuillEditor
              structureId={structureId}
              content={formData.metadata}
              onEditorChange={handleEditorChange}
            />
          </div>
          {/* Add Tags Button with Icon */}
          <div className="mt-4 flex items-center justify-start">
            <button
              onClick={() => handleFeatureClick(canTags, addTag)}
              className="px-4 py-2 text-white bg-custom-main rounded-md hover:bg-red-800 focus:outline-none flex items-center"
            >
              <BsTags className="h-5 w-5 mr-2" /> Add Tags
            </button>
          </div>

          {/* Tags Section */}
          {tags?.length > 0 && (
            <div className="mt-4">
              <div className="max-h-40 overflow-y-auto pr-3">
                {/* Adding padding-right to prevent overlap */}
                {tags?.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between mt-2"
                  >
                    {/* Key Input */}
                    <div className="flex flex-col w-60 space-y-1">
                      <label
                        htmlFor={`key-${tag.id}`}
                        className="text-sm text-gray-600"
                      >
                        Key
                      </label>
                      <input
                        id={`key-${tag?.id}`}
                        type="text"
                        placeholder="Key"
                        value={tag.key}
                        onChange={(e) =>
                          handleTagChange(tag.id, "key", e?.target?.value)
                        }
                        className="border-2 border-gray-300 rounded-md p-2 focus:border-custom-main focus:outline-none"
                      />
                    </div>

                    {/* Value Input */}
                    <div className="flex flex-col w-60 space-y-1">
                      <label
                        htmlFor={`value-${tag?.id}`}
                        className="text-sm text-gray-600"
                      >
                        Value
                      </label>
                      <input
                        id={`value-${tag.id}`}
                        type="text"
                        placeholder="Value"
                        value={tag.value}
                        onChange={(e) =>
                          handleTagChange(tag.id, "value", e?.target?.value)
                        }
                        className="border-2 border-gray-300 rounded-md p-2 focus:border-custom-main focus:outline-none"
                      />
                    </div>

                    {/* Delete Icon */}
                    <button
                      onClick={() => deleteTag(tag?.id)}
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-custom-main text-white hover:bg-custom-main-dark"
                    >
                      <IoTrash className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end bg-gray-100 px-4 py-2 rounded-b-lg border-t border-gray-300 space-x-3">
          <button
            onClick={onClose}
            className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || isLoading}
            className={`py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg ${
              hasChanges
                ? "bg-custom-main text-white hover:bg-red-800"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isLoading ? "Loading..." : submitText}
          </button>
        </div>
      </div>
    </>
  );
};

export default AddQuillModal;
