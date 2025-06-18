import React from "react"

const ConfirmationModal = ({
  isOpen,
  title,
  content,
  onReparent,
  onReorder,
  onClose,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <p className="mb-6">{content}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onReparent}
            className="px-4 py-2 bg-custom-main text-white rounded hover:bg-red-700"
          >
            Reparent
          </button>
          <button
            onClick={onReorder}
            className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
          >
            Reorder
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
