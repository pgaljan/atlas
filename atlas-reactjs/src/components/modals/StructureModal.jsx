import React, { useState } from "react"
import InputField from "../input-field/InputField"
import ModalComponent from "./Modal"

const StructureModal = ({ isOpen, onClose, onSubmit }) => {
  const [inputValue, setInputValue] = useState("")

  const handleInputChange = e => {
    setInputValue(e?.target?.value)
  }

  const handleSubmit = () => {
    onSubmit(inputValue)
    onClose()
  }

  const handleKeyDown = e => {
    const allowedKeys = ["Enter", "NumpadEnter"]
    if (allowedKeys?.includes(e?.key)) {
      handleSubmit()
    }
  }

  return (
    <ModalComponent
      isOpen={isOpen}
      onClose={onClose}
      title="Create Structure"
      onSubmit={handleSubmit}
      submitText="Create Structure"
      cancelText="Cancel"
      modalHeight="auto"
      modalWidth=""
    >
      <InputField
        label="Structure name"
        name="inputField"
        onKeyDown={handleKeyDown}
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Enter structure name"
      />
    </ModalComponent>
  )
}

export default StructureModal
