import React, { useState } from "react"
import { AiOutlineFontSize, AiOutlinePlus } from "react-icons/ai"
import { BiLink } from "react-icons/bi"
import { RiPlayListAddFill } from "react-icons/ri"
import { FiType } from "react-icons/fi"
import Tooltip from "../tooltip/Tooltip"
import useOutsideClick from "../../hooks/useOutsideClick"
import AddRecordModal from "./AddRecordModal"
import { FaCirclePlus } from "react-icons/fa6"
import ModalComponent from "./Modal"
import InputField from "../input-field/InputField"

const NodeModal = ({ position, onClose }) => {
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [childModalVisible, setChildModalVisible] = useState(false)
  const [childValue, setChildValue] = useState("")
  const [recordModalVisible, setRecordModalVisible] = useState(false)

  const modalRef = useOutsideClick(() => {
    if (!recordModalVisible && !childModalVisible && !modalVisible) {
      onClose()
    }
  })
  const handleAddChildSubmit = () => {
    setChildModalVisible(false)
  }

  return (
    <>
      <div
        ref={modalRef}
        style={{
          position: "fixed",
          left: position.x,
          top: position.y,
        }}
        className="bg-white border border-gray-300 rounded-lg shadow-md p-3  w-auto z-50"
      >
        <div className="flex flex-wrap gap-4 items-center justify-start ">
          <Tooltip label="Add Record">
            <button
              onClick={() => {
                setModalVisible(true)
                setActiveDropdown(null)
              }}
              aria-label="Add Record"
              className="hover:bg-gray-100 rounded-full cursor-pointer p-2 focus:ring-2 focus:ring-custom-main"
            >
              <RiPlayListAddFill size={24} className="text-custom-main" />
            </button>
          </Tooltip>

          <Tooltip label="Decrease Text Size">
            <button
              aria-label="Decrease Text Size"
              className="hover:bg-gray-100 rounded-full cursor-pointer p-2  focus:ring-2 focus:ring-custom-main"
            >
              <AiOutlineFontSize
                size={24}
                className="text-custom-main rotate-180"
              />
            </button>
          </Tooltip>

          <Tooltip label="Increase Text Size">
            <button
              aria-label="Increase Text Size"
              className="hover:bg-gray-100 rounded-full cursor-pointer p-2 focus:ring-2 focus:ring-custom-main"
            >
              <AiOutlineFontSize size={24} className="text-custom-main" />
            </button>
          </Tooltip>

          <Tooltip label="Text Color">
            <button
              aria-label="Text Color"
              className="hover:bg-gray-100 rounded-full cursor-pointer p-2 focus:ring-2 focus:ring-custom-main"
              onClick={() => setActiveDropdown(null)}
            >
              <FiType size={24} className="text-custom-main" />
            </button>
          </Tooltip>

          <Tooltip label="Edit Link">
            <button
              aria-label="Edit Link"
              className="hover:bg-gray-100 rounded-full cursor-pointer p-2  focus:ring-2 focus:ring-custom-main"
              onClick={() => setActiveDropdown(null)}
            >
              <BiLink size={24} className="text-custom-main" />
            </button>
          </Tooltip>
          <Tooltip label="Add Element">
            <button
              aria-label="Add Element"
              className="hover:bg-gray-100 rounded-full cursor-pointer p-2  focus:ring-2 focus:ring-custom-main"
              onClick={() => {
                setChildModalVisible(true)
                setActiveDropdown(null)
              }}
            >
              <FaCirclePlus size={24} className="text-custom-main" />
            </button>
          </Tooltip>
        </div>
      </div>
      {modalVisible && (
        <AddRecordModal
          position={{ x: window.innerWidth / 2, y: window.innerHeight / 2 }}
          onClose={() => setModalVisible(false)}
        />
      )}
      {childModalVisible && (
        <ModalComponent
          isOpen={childModalVisible}
          onClose={() => setChildModalVisible(false)}
          title="Add Element"
          onSubmit={handleAddChildSubmit}
          submitText="Save"
          cancelText="Cancel"
        >
          <InputField
            label="Element Title"
            name="elementTitle"
            value={childValue}
            onChange={e => setChildValue(e.target.value)}
            placeholder="Enter element title"
          />
        </ModalComponent>
      )}
    </>
  )
}

export default NodeModal
