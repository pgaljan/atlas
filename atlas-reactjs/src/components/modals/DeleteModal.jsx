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
            className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
           className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg  bg-custom-main text-white  hover:bg-red-800 "
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
