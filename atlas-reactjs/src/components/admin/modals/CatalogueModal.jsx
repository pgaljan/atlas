import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { uploadRawFile } from "../../../redux/slices/upload-files";

const CatalogueModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  catalogueName,
  setCatalogueName,
  selectedUserTier,
  setSelectedUserTier,
  userTiers,
  description,
  setDescription,
  file,
  setFile,
  thumbnailUrl,
  setThumbnailUrl,
}) => {
  const dispatch = useDispatch();
  const userId = Cookies.get("atlas_userId");

  const [previewFileUrl, setPreviewFileUrl] = useState("");
  const [previewThumbnailUrl, setPreviewThumbnailUrl] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // When the modal opens, pre-populate preview state from props
  useEffect(() => {
    if (isOpen) {
      if (file) {
        setPreviewFileUrl(file);
      }
      if (thumbnailUrl) {
        setPreviewThumbnailUrl(thumbnailUrl);
      }
    }
  }, [isOpen, file, thumbnailUrl]);

  useEffect(() => {
    if (!isOpen) {
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;
  const validate = () => {
    const newErrors = {};
    if (!catalogueName.trim())
      newErrors.catalogueName = "Catalogue name is required !";
    if (!previewThumbnailUrl) newErrors.thumbnailUrl = "Thumbnail is required!";
    if (!previewFileUrl) newErrors.file = "File is required!";
    if (!selectedUserTier) newErrors.userTier = "Please select a user tier!";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const result = await dispatch(
      uploadRawFile({
        file: selectedFile,
        userId,
      })
    );

    if (result.type.endsWith("fulfilled")) {
      setPreviewFileUrl(result.payload.fileUrl);
      setFile(result.payload.fileUrl);
      setErrors((prev) => ({ ...prev, file: undefined }));
    }
  };

  const handleThumbnailChange = async (e) => {
    const selectedThumbnail = e.target.files[0];
    if (!selectedThumbnail) return;

    const result = await dispatch(
      uploadRawFile({
        file: selectedThumbnail,
        userId,
      })
    );

    if (result.type.endsWith("fulfilled")) {
      setPreviewThumbnailUrl(result.payload.fileUrl);
      setThumbnailUrl(result.payload.fileUrl);
      setErrors((prev) => ({ ...prev, thumbnailUrl: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const fileUrlToSubmit = previewFileUrl || file;
      const thumbnailUrlToSubmit = previewThumbnailUrl || thumbnailUrl;

      await onSubmit({
        catalogueName,
        description,
        fileUrl: fileUrlToSubmit,
        thumbnailUrl: thumbnailUrlToSubmit,
        userTier: selectedUserTier,
      });
      setIsSubmitting(false);
      // Clear form fields if desired.
      setCatalogueName("");
      setDescription("");
      setFile("");
      setThumbnailUrl("");
      setPreviewFileUrl("");
      setPreviewThumbnailUrl("");
      onClose();
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const renderFilePreview = (url) => {
    if (!url) return null;
    const isImage = /\.(png|jpg|jpeg|svg)$/i.test(url);
    return isImage ? (
      <img
        src={url}
        alt="File preview"
        className="h-12 w-12 object-cover rounded"
      />
    ) : (
      <p className="text-xs text-gray-600 mt-1">File: {url}</p>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-end z-50">
      <div className="bg-white flex flex-col items-start rounded-3xl shadow-lg p-6 w-[400px] h-full overflow-auto relative">
        <h4 className="mb-2 text-3xl font-bold text-gray-800">{title}</h4>
        <p className="text-base text-start text-gray-500 mb-6">
          Enter details to {title.toLowerCase()}
        </p>

        <form className="space-y-4">
          {/* Catalogue Name */}
          <div className="mb-4 flex items-start flex-col">
            <label className="block text-gray-700 font-medium mb-2">
              Catalogue Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-custom-main"
              value={catalogueName}
              onChange={(e) => {
                setCatalogueName(e.target.value);
                if (e.target.value.trim() !== "") {
                  setErrors((prev) => ({ ...prev, catalogueName: undefined }));
                }
              }}
              placeholder="Enter catalogue name"
            />
            {errors.catalogueName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.catalogueName}
              </p>
            )}
          </div>

          {/* Catalogue Description */}
          <div className="mb-4 flex items-start flex-col">
            <label className="block text-gray-700 font-medium mb-2">
              Catalogue Description
            </label>
            <textarea
              className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-custom-main"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter catalogue description"
              rows={3}
            />
          </div>

          {/* Thumbnail Upload */}
          <div className="mb-4 flex items-start flex-col">
            <label className="block text-gray-700 font-medium mb-2">
              Select Thumbnail <span className="text-red-600">*</span>
            </label>
            <input
              type="file"
              accept=".png, .jpg, .jpeg, .svg"
              className="border border-gray-300 rounded-md p-2 w-full"
              onChange={handleThumbnailChange}
            />
            <p className="text-xs text-gray-500 mt-2">
              Allowed formats: <strong>.png, .jpg, .jpeg, .svg</strong>
            </p>
            {previewThumbnailUrl && (
              <div className="mt-2">
                {renderFilePreview(previewThumbnailUrl)}
              </div>
            )}
            {errors.thumbnailUrl && (
              <p className="text-red-500 text-sm mt-1">{errors.thumbnailUrl}</p>
            )}
          </div>

          {/* File Upload */}
          <div className="mb-4 flex items-start flex-col">
            <label className="block text-gray-700 font-medium mb-2">
              Select File <span className="text-red-600">*</span>
            </label>
            <input
              type="file"
              accept=".zip, .xlsx, .xls, .csv, .json"
              className="border border-gray-300 rounded-md p-2 w-full"
              onChange={handleFileChange}
            />
            <p className="text-xs text-gray-500 mt-2">
              Allowed formats: <strong>.zip, .xlsx, .xls, .csv, .json</strong>
            </p>
            {previewFileUrl && (
              <div className="mt-2">{renderFilePreview(previewFileUrl)}</div>
            )}
            {errors.file && (
              <p className="text-red-500 text-sm mt-1">{errors.file}</p>
            )}
          </div>

          {/* User Tier */}
          <div className="mb-4 flex items-start flex-col">
            <label className="block text-gray-700 font-medium mb-2">
              Available for User Tier <span className="text-red-600">*</span>
            </label>
            <select
              className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-custom-main"
              value={selectedUserTier}
              onChange={(e) => {
                setSelectedUserTier(e.target.value);
                if (e.target.value) {
                  setErrors((prev) => ({ ...prev, userTier: undefined }));
                }
              }}
            >
              {userTiers.map((tier) => (
                <option key={tier} value={tier}>
                  {tier}
                </option>
              ))}
            </select>
            {errors.userTier && (
              <p className="text-red-500 text-sm mt-1">{errors.userTier}</p>
            )}
          </div>

          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              className="py-2 px-4 rounded-md bg-gray-600 text-white hover:bg-gray-500"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="flex items-center gap-2 py-2 px-4 rounded-md bg-custom-main text-white hover:bg-custom-dark disabled:opacity-50"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Loading..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CatalogueModal;
