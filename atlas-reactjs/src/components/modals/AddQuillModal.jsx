import cogoToast from "@successtar/cogo-toast";
import React, { useCallback, useEffect, useState } from "react";
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
import QuillEditor from "../editors/quill.editor";
import VsCodeEditor from "../editors/vscode.editor";
import DiscardModal from "../modals/DiscardModal";

const AddQuillModal = ({
  structureId,
  position,
  onClose,
  elementId,
  fetchData,
  onSuccess,
  actionType,
  text,
  submitText,
  cancelText,
  recordId,
  elementValue,
}) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState({
    quilleditor: "",
    vscode: "",
    tags: [],
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState({
    metadata: "",
  });
  const [tags, setTags] = useState([]);
  const [isVsCode, setIsVsCode] = useState(false);
  const canTags = useFeatureFlag("Record Tagging");
  const [discardModalVisible, setDiscardModalVisible] = useState(false);
  const [pendingToggle, setPendingToggle] = useState(null);
  const [quillContent, setQuillContent] = useState("");
  const [vsCodeContent, setVsCodeContent] = useState("");
  const [mermaidSvg, setMermaidSvg] = useState("");

  const handleFeatureClick = (canAccess, action) => {
    if (canAccess) {
      action();
    } else {
      navigate(`?plan=upgrade-to-premium`);
    }
  };

  // Custom function to fetch record data
  const fetchRecordData = useCallback(async () => {
    if (actionType === "edit" && recordId) {
      try {
        const record = await dispatch(getRecordById(recordId)).unwrap();
        if (record) {
          // Load based on editorType
          const quillData =
            record.metadata.editorType === "quilleditor"
              ? record.metadata.content
              : "";
          const vscodeData =
            record.metadata.editorType === "vscode"
              ? record.metadata.content
              : "";
          setQuillContent(quillData);
          setVsCodeContent(vscodeData);
          setTags(record.tags || []);
          setInitialData({
            quilleditor: quillData,
            vscode: vscodeData,
            tags: record.tags || [],
          });
          // Set current editor based on existing data
          setIsVsCode(record.metadata.editorType === "vscode");
        }
      } catch (error) {
        cogoToast.error(`Failed to fetch record: ${error.message}`);
      }
    }
  }, [actionType, recordId, dispatch]);

  useEffect(() => {
    fetchRecordData();
  }, [fetchRecordData]);

  useEffect(() => {
    const currentContent = isVsCode ? vsCodeContent : quillContent;
    const initialContent = isVsCode
      ? initialData.vscode
      : initialData.quilleditor;
    const metadataChanged = currentContent !== initialContent;
    const tagsChanged =
      JSON.stringify(tags) !== JSON.stringify(initialData.tags);
    setHasChanges(metadataChanged || tagsChanged);
  }, [quillContent, vsCodeContent, tags, initialData, isVsCode]);

  const handleEditorChange = (value) => {
    if (isVsCode) {
      setVsCodeContent(value);
    } else {
      setQuillContent(value);
    }
  };

  const handleSave = async () => {
    const currentContent = isVsCode ? vsCodeContent : quillContent;
    if (!currentContent?.trim()) {
      cogoToast.error("Metadata is required!");
      return;
    }
    if (
      tags.length > 0 &&
      tags.some((tag) => !tag.key.trim() || !tag.value.trim())
    ) {
      cogoToast.error("Each tag must have both a key and a value.");
      return;
    }
    const editorType = isVsCode ? "vscode" : "quilleditor";
    const parsedMetadata = { content: currentContent, editorType };
    const createRecordDto = {
      metadata: parsedMetadata,
      tags,
      recordSvg: isVsCode ? mermaidSvg : undefined,
    };

    try {
      setIsLoading(true);
      if (actionType === "edit") {
        const updateRecordDto = {
          metadata: parsedMetadata,
          tags,
          recordSvg: isVsCode ? mermaidSvg : undefined,
        };
        await dispatch(updateRecord({ recordId, updateRecordDto })).unwrap();
        cogoToast.success("Record updated successfully!");
        await dispatch(getRecordById(recordId)).unwrap();
      } else if (actionType === "add") {
        const response = await dispatch(
          createRecord({ elementId, createRecordDto })
        ).unwrap();
        await dispatch(getRecordById(response.recordId)).unwrap();
        cogoToast.success("Record added successfully!");
      }
      onClose();
      onSuccess();
      fetchData();
    } catch (error) {
      cogoToast.error(`Error adding record: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    const currentContent = (isVsCode ? vsCodeContent : quillContent).trim();
    const hasUnsavedData = currentContent || tags.length;

    hasUnsavedData
      ? (setPendingToggle(!isVsCode), setDiscardModalVisible(true))
      : (setIsVsCode(!isVsCode),
        setTags([]),
        isVsCode ? setQuillContent("") : setVsCodeContent(""));
  };

  const confirmToggle = () => {
    setQuillContent("");
    setVsCodeContent("");
    setTags([]);
    setIsVsCode(pendingToggle);
    setDiscardModalVisible(false);
    setPendingToggle(null);
  };

  const cancelToggle = () => {
    setDiscardModalVisible(false);
    setPendingToggle(null);
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
        className={`bg-white border border-gray-300 rounded-lg shadow-lg z-50 ${
          isVsCode ? "w-[1300px]" : "w-[850px]"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-t-lg border-b border-gray-300">
          <h2 className="text-xl font-semibold text-gray-800">{text} Record</h2>
          <button
            className="text-gray-500 hover:text-gray-700 text-"
            onClick={onClose}
          >
            ✖
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 overflow-y-auto">
          <label className="block text-sm font-medium text-gray-700">
            {elementValue}
          </label>
          <div>
            {isVsCode ? (
              <VsCodeEditor
                content={vsCodeContent}
                structureId={structureId}
                onEditorChange={handleEditorChange}
                recordId={recordId}
                onSvgChange={setMermaidSvg}
              />
            ) : (
              <QuillEditor
                content={quillContent}
                onEditorChange={handleEditorChange}
                structureId={structureId}
              />
            )}
          </div>
          {/* Add Tags Button with Icon */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <button
                onClick={() => handleFeatureClick(canTags, addTag)}
                className="px-4 py-2 text-white bg-custom-main rounded-md hover:bg-red-800 focus:outline-none flex items-center"
              >
                <BsTags className="h-5 w-5 mr-2" /> Add Tags
              </button>
            </div>

            <div className="flex items-center">
              <span
                className={`font-semibold pr-1 text-base ${
                  isVsCode ? "text-custom-main pr-1" : "text-gray-700"
                }`}
              >
                VS Code Editor
              </span>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVsCode}
                  onChange={handleToggle}
                  className="sr-only peer"
                />
                <div
                  className={`w-12 h-6 rounded-full transition-all ${
                    isVsCode
                      ? "bg-custom-main border-none"
                      : "bg-gray-200 border border-gray-300"
                  }`}
                ></div>
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white border border-gray-600 rounded-full peer-checked:translate-x-6 peer-checked:border-custom-main transition-transform ${
                    isVsCode ? "" : "!bg-custom-main"
                  }`}
                ></div>
              </label>
            </div>
          </div>

          {/* Tags Section */}
          {tags?.length > 0 && (
            <div className="mt-4">
              <div className="max-h-40 overflow-y-auto pr-3">
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
      {discardModalVisible && (
        <DiscardModal
          isOpen={discardModalVisible}
          title={"Editor Content?"}
          onClose={cancelToggle}
          onConfirm={confirmToggle}
        />
      )}
    </>
  );
};

export default AddQuillModal;
