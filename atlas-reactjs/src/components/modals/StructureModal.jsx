import cogoToast from "@successtar/cogo-toast";
import Cookies from "js-cookie";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createStructure } from "../../redux/slices/structures";
import InputField from "../input-field/InputField";
import Textarea from "../text-area/Textarea";
import ModalComponent from "./Modal";

const Visibility = {
  PUBLIC: "public",
  PRIVATE: "private",
};

const StructureModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [visibility, setVisibility] = useState(Visibility.PUBLIC);
  const dispatch = useDispatch();

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleVisibilityChange = (e) => {
    setVisibility(e.target.value);
  };

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;

    const ownerId = Cookies.get("atlas_userId");
    const username = Cookies.get("atlas_username");

    if (!ownerId) {
      cogoToast.error("User not authenticated");
      return;
    }

    const structureData = {
      name: inputValue,
      description,
      visibility,
      ownerId: ownerId,
    };

    try {
      setLoading(true);
      const createdStructure = await dispatch(
        createStructure(structureData)
      ).unwrap();
      const structureId = createdStructure?.structure?.id;
      if (structureId) {
        cogoToast.success("Structure created successfully!");
        setInputValue("");
        setDescription("");
        onClose();
        navigate(`/app/s/${username}/${structureId}`);
      } else {
        throw new Error("Structure ID is missing in the response");
      }
    } catch (error) {
      cogoToast.error(error.message || "Failed to create structure");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (["Enter", "NumpadEnter"].includes(e.key) && inputValue.trim()) {
      handleSubmit();
    }
  };

  return (
    <ModalComponent
      isOpen={isOpen}
      loading={loading}
      onClose={onClose}
      title="Create Structure"
      onSubmit={handleSubmit}
      submitText="Create Structure"
      cancelText="Cancel"
      modalHeight="auto"
      modalWidth=""
      disabled={!inputValue.trim()}
    >
      <InputField
        label="Structure Name"
        name="inputField"
        onKeyDown={handleKeyDown}
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Enter structure name"
      />

      <Textarea
        placeholder="Write your description..."
        label="Description (optional)"
        value={description}
        onChange={handleDescriptionChange}
        required={false}
      />

      <div className="flex items-center space-x-6 mt-4">
        <label className="flex items-center space-x-2 text-black">
          <input
            type="radio"
            name="visibility"
            value={Visibility.PUBLIC}
            checked={visibility === Visibility.PUBLIC}
            onChange={handleVisibilityChange}
            className="appearance-none w-5 h-5 border-2 border-custom-main rounded-full focus:outline-none checked:relative checked:after:content-[''] checked:after:block checked:after:w-2.5 checked:after:h-2.5 checked:after:rounded-full checked:after:bg-custom-main checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:transform checked:after:-translate-x-1/2 checked:after:-translate-y-1/2"
          />
          <span>Public</span>
        </label>

        <label className="flex items-center space-x-2 text-black">
          <input
            type="radio"
            name="visibility"
            value={Visibility.PRIVATE}
            checked={visibility === Visibility.PRIVATE}
            onChange={handleVisibilityChange}
            className="appearance-none w-5 h-5 border-2 border-custom-main rounded-full focus:outline-none checked:relative checked:after:content-[''] checked:after:block checked:after:w-2.5 checked:after:h-2.5 checked:after:rounded-full checked:after:bg-custom-main checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:transform checked:after:-translate-x-1/2 checked:after:-translate-y-1/2"
          />
          <span>Private</span>
        </label>
      </div>
    </ModalComponent>
  );
};

export default StructureModal;
