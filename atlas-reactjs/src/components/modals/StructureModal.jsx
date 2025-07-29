import cogoToast from "@successtar/cogo-toast"
import Cookies from "js-cookie"
import { useState } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { createStructure } from "../../redux/slices/structures"
import InputField from "../input-field/InputField"
import Textarea from "../text-area/Textarea"
import ModalComponent from "./Modal"
import RendererModal from "./RendererModal"

const Visibility = {
  PUBLIC: "public",
  PRIVATE: "private",
}

const StructureModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [inputValue, setInputValue] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [structureId, setStructureId] = useState(null)
  const [showRendererModal, setShowRendererModal] = useState(false)
  const [visibility, setVisibility] = useState(Visibility.PUBLIC)
  const [selectedStructureType, setSelectedStructureType] = useState("default")

  const handleSubmit = async () => {
    if (!inputValue.trim()) return

    const ownerId = Cookies.get("atlas_userId")
    const workspaceId = Cookies.get("workspaceId")

    if (!ownerId) {
      cogoToast.error("User not authenticated")
      return
    }

    const structureData = {
      name: inputValue,
      description,
      visibility,
      ownerId,
      workspaceId,
      type: selectedStructureType,
    }

    try {
      setLoading(true)
      const createdStructure = await dispatch(
        createStructure(structureData)
      ).unwrap()
      cogoToast.success("Structure created successfully!")

      const id = createdStructure?.structure?.id
      if (id) {
        setStructureId(id)
        setShowRendererModal(true)
        setInputValue("")
        setDescription("")
        onClose()
      } else {
        throw new Error("Structure ID is missing in the response")
      }
    } catch (error) {
      cogoToast.error(error.message || "Failed to create structure")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = e => {
    if (["Enter", "NumpadEnter"].includes(e.key) && inputValue.trim()) {
      handleSubmit()
    }
  }

  const handleRendererSelect = renderer => {
    setShowRendererModal(false)
    const username = Cookies.get("atlas_username")
    if (structureId && username) {
      navigate(`/app/s/${username}/${structureId}?renderer=${renderer}`)
    }
  }

  return (
    <>
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
          onChange={e => setInputValue(e.target.value)}
          placeholder="Enter structure name"
        />

        <Textarea
          placeholder="Write your description..."
          label="Description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required={false}
        />

        <div className="mt-4">
          <label className="block text-black font-medium mb-2">
            Structure Type
          </label>
          <div className="flex items-center space-x-6">
            {["default", "faultTree"].map(type => (
              <label
                key={type}
                className="flex items-center space-x-2 text-black"
              >
                <input
                  type="radio"
                  name="structureType"
                  value={type}
                  checked={selectedStructureType === type}
                  onChange={() => setSelectedStructureType(type)}
                  className="appearance-none w-5 h-5 border-2 border-custom-main rounded-full focus:outline-none checked:relative checked:after:content-[''] checked:after:block checked:after:w-2.5 checked:after:h-2.5 checked:after:rounded-full checked:after:bg-custom-main checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:transform checked:after:-translate-x-1/2 checked:after:-translate-y-1/2"
                />
                <span>{type === "default" ? "Default" : "Fault Tree"}</span>
              </label>
            ))}
          </div>
        </div>
      </ModalComponent>

      <RendererModal
        isOpen={showRendererModal}
        onClose={() => setShowRendererModal(false)}
        onSelect={handleRendererSelect}
        structureType={selectedStructureType}
      />
    </>
  )
}

export default StructureModal
