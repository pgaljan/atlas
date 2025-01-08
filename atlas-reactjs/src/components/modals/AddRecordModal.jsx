import React, { useState, useRef } from "react"
import TinyMCE from "../editors/tinymce"

const AddRecordModal = ({ position, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  })

  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = () => {
    onSave(formData)
    onClose()
  }

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
        className="bg-white border border-gray-300 rounded-lg shadow-lg w-[600px] z-50"
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-t-lg border-b border-gray-300">
          <h2 className="text-lg font-semibold text-gray-800">
            Add New Record
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {/* TinyMCE Editor */}
          <div>
            <TinyMCE />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end bg-gray-100 px-4 py-2 rounded-b-lg border-t border-gray-300 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm text-white bg-custom-main rounded-md  focus:outline-none"
          >
            Save
          </button>
        </div>
      </div>
    </>
  )
}

export default AddRecordModal
