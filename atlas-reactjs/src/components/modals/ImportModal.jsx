import React from "react";

const ImportModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Import Backups</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ✖
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex flex-col items-center mt-6">
          <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col justify-center items-center bg-gray-50 hover:bg-gray-100 cursor-pointer">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/73/Flat_tick_icon.svg"
              alt="Import"
              className="w-16 h-16 mb-4"
            />
            <p className="text-gray-600 font-medium">
              Drop files here to import
            </p>
            <p className="text-sm text-gray-400 mt-1 text-center">
              Supported format:{" "}
              <span className="font-medium text-gray-600">.zip</span>
            </p>
          </div>

          <p className="mt-4 text-blue-500 underline cursor-pointer">
            or browse files
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
