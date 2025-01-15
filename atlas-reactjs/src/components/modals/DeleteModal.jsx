import React from "react";

const DeleteModal = ({ isOpen, onClose, onConfirm, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80">
        <h2 className="text-lg font-bold text-gray-800">Delete {title}</h2>
        <p className="text-gray-600 mt-2">
          Are you sure you want to delete the <strong>{title}</strong>? This
          action cannot be undone.
        </p>
        <div className="mt-4 flex justify-end gap-4">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-custom-main text-white rounded-lg hover:bg-red-900"
            onClick={onConfirm}
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
