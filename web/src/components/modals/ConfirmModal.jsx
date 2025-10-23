import React from 'react';
import { createPortal } from 'react-dom';

const ConfirmModal = ({
  isOpen,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmText = 'Yes',
  cancelText = 'Cancel',
  loading = false,
  onClose = () => {},
  onConfirm = () => {},
}) => {
  if (!isOpen) return null;

  const node = (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-gray-600 mt-2">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="py-2 px-4 inline-flex items-center text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
            disabled={loading}
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className={`py-2 px-4 inline-flex items-center text-sm font-medium rounded-lg text-white ${
              loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-custom-main hover:bg-red-900'
            }`}
            disabled={loading}
          >
            {loading ? 'Working...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(node, document.body) : null;
};

export default ConfirmModal;
