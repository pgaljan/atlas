import React from "react"
import { BiUndo, BiRedo, BiSave, BiLink, BiLock, BiMove } from "react-icons/bi"

import { FaAlignLeft, FaAlignCenter, FaAlignRight } from "react-icons/fa"
import { FiType } from "react-icons/fi"

const NodeModal = ({ position, onClose }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
      }}
      className="bg-white border border-gray-300 rounded-md shadow-lg p-4 w-auto "
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
      >
        &times;
      </button>

      <div className="flex gap-2 justify-start items-center flex-wrap">
        <button title="Undo" className="hover:bg-gray-100 rounded-full p-2">
          <BiUndo size={24} className="text-custom-main" />
        </button>

        <button title="Redo" className="hover:bg-gray-100 rounded-full p-2">
          <BiRedo size={24} className="text-custom-main" />
        </button>

        <button title="Save" className="hover:bg-gray-100 rounded-full p-2">
          <BiSave size={24} className="text-custom-main" />
        </button>

        <button title="Move" className="hover:bg-gray-100 rounded-full p-2">
          <BiMove size={24} className="text-custom-main" />
        </button>

        <button title="Lock" className="hover:bg-gray-100 rounded-full p-2">
          <BiLock size={24} className="text-custom-main" />
        </button>

        <button
          title="Align Left"
          className="hover:bg-gray-100 rounded-full p-2"
        >
          <FaAlignLeft size={24} className="text-custom-main" />
        </button>
        <button
          title="Align Center"
          className="hover:bg-gray-100 rounded-full p-2"
        >
          <FaAlignCenter size={24} className="text-custom-main" />
        </button>
        <button
          title="Align Right"
          className="hover:bg-gray-100 rounded-full p-2"
        >
          <FaAlignRight size={24} className="text-custom-main" />
        </button>

        <button
          title="Text Color"
          className="hover:bg-gray-100 rounded-full p-2"
        >
          <FiType size={24} className="text-custom-main" />
        </button>

        <button
          title="Edit Link"
          className="hover:bg-gray-100 rounded-full p-2"
        >
          <BiLink size={24} className="text-custom-main" />
        </button>
      </div>
    </div>
  )
}

export default NodeModal
