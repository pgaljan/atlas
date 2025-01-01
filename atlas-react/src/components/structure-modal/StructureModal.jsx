import React, { useState } from "react";
import ModalComponent from "../../containers/common/modal/Modal";
import InputField from "../../containers/common/input-field/InputField";

const StructureModal = ({ isOpen, onClose, onSubmit }) => {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e) => {
    setInputValue(e?.target?.value);
  };

  const handleSubmit = () => {
    onSubmit(inputValue);
    onClose();
  };

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
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Enter structure name"
      />
    </ModalComponent>
  );
};

export default StructureModal;
