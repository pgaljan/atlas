import cogoToast from "@successtar/cogo-toast"
import Cookies from "js-cookie"
import { useEffect, useRef, useState } from "react"
import { FaEdit } from "react-icons/fa"
import { FaCirclePlus } from "react-icons/fa6"
import { GiBrassEye } from "react-icons/gi"
import { IoIosRemoveCircle } from "react-icons/io"
import { IoTrash } from "react-icons/io5"
import { PiTreeStructureFill } from "react-icons/pi"
import { RiEditCircleFill, RiPlayListAddFill } from "react-icons/ri"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import useFeatureFlag from "../../hooks/useFeatureFlag"
import useOutsideClick from "../../hooks/useOutsideClick"
import {
  createElement,
  deleteElement,
  fetchElementById,
  updateElement,
} from "../../redux/slices/elements"
import { deleteRecord, getRecordsByElement } from "../../redux/slices/records"
import { updateStructure } from "../../redux/slices/structures"
import { uploadFile } from "../../redux/slices/upload-files"
import {
  getRoleAccessMap,
  getRoleAndAccess,
} from "../../utils/permissionFunctions"
import InputField from "../input-field/InputField"
import Tooltip from "../tooltip/Tooltip"
import AddQuillModal from "./AddQuillModal"
import DeleteModal from "./DeleteModal"
import ImportModal from "./ImportModal"
import ModalComponent from "./Modal"

const NodeModal = ({
  position,
  onClose,
  structureId,
  parentId,
  wbs,
  recordId,
  onSuccess,
  elementId,
  structureName: initialStructureName,
  structureType,
  renderType,
  permission,
}) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const focusRef = useRef(null)
  const userId = Cookies.get("atlas_userId")
  const [isLoading, setIsLoading] = useState(false)
  const [deleteRecordId, setDeleteRecordId] = useState(null)
  const [recordExists, setRecordExists] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [childModalVisible, setChildModalVisible] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [elementValue, setElementValue] = useState("")
  const [actionType, setActionType] = useState(null)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editStructureModalVisible, setEditStructureModalVisible] =
    useState(false)
  const [structureName, setStructureName] = useState(initialStructureName)
  const [elementType, setElementType] = useState("event")
  const [eventType, setEventType] = useState("")
  const [gateType, setGateType] = useState("")
  const [eventValue, setEventValue] = useState("")
  const [eventValueType, seEventValueType] = useState("")
  const [missionTime, setMissionTime] = useState("")
  const [mttr, setMttr] = useState("")
  const [description, setDescription] = useState("")
  const [inputK, setInputK] = useState("")
  const [outputN, setOutputN] = useState("")
  const [deleting, setDeleting] = useState(false)
  const { role } = getRoleAndAccess(permission)
  const roleAccess = getRoleAccessMap(role)

  const canImportStructure = useFeatureFlag("Import from Excel")
  const canTagRecord = useFeatureFlag("Rich Text Records")

  const handleFeatureClick = (canAccess, action) => {
    if (canAccess) {
      action()
    } else {
      navigate(`?plan=upgrade-to-premium`)
    }
  }

  const modalRef = useOutsideClick(() => {
    if (
      !isImportModalOpen &&
      !editStructureModalVisible &&
      !childModalVisible &&
      !modalVisible &&
      !deleteModalVisible
    ) {
      onClose()
    }
  })

  const handleModalSubmit = async () => {
    if (!elementValue.trim()) {
      cogoToast.error("Element title cannot be empty")
      return
    }

    if (structureType !== "default" && renderType !== "markmap") {
      if (elementType === "event") {
        if (!eventType) {
          cogoToast.warn("Please select an event type.")
          return
        }

        if (!eventValueType) {
          cogoToast.warn("Please select an event value type.")
          return
        }

        if (["conditional", "undeveloped"].includes(eventType)) {
          if (eventValueType === "λ") {
            cogoToast.warn(
              `${eventType} events cannot take Rate (λ) as value. Only Probability (P) is allowed.`
            )
            return
          }
        }

        if (eventType === "basic") {
          if (eventValueType === "λ" && !missionTime) {
            cogoToast.warn("Mission Time is required when using Rate (λ).")
            return
          }
        }
      }

      if (elementType === "gate" && gateType === "voting-or") {
        const isFloat = val =>
          val !== "" &&
          !isNaN(val) &&
          val.toString().includes(".") &&
          parseFloat(val) > 0

        const isEmpty = val => val === "" || val === null

        const inputEmpty = isEmpty(inputK)
        const outputEmpty = isEmpty(outputN)

        if (inputEmpty && outputEmpty) {
          cogoToast.warn(
            "Both Input (K) and Output (N) are required and must be decimal numbers (e.g. 1.0)"
          )
          return
        }

        if (inputEmpty) {
          cogoToast.warn(
            "Input (K) is required and must be a decimal number (e.g. 1.0)"
          )
          return
        }

        if (outputEmpty) {
          cogoToast.warn(
            "Output (N) is required and must be a decimal number (e.g. 1.0)"
          )
          return
        }

        const inputValid = isFloat(inputK)
        const outputValid = isFloat(outputN)

        if (!inputValid && !outputValid) {
          cogoToast.warn(
            "Both Input (K) and Output (N) must be decimal positive numbers (e.g. 1.0, 2.5)"
          )
          return
        }

        if (!inputValid) {
          cogoToast.warn(
            "Input (K) must be a decimal positive number (e.g. 1.0, 2.5)"
          )
          return
        }

        if (!outputValid) {
          cogoToast.warn(
            "Output (N) must be a decimal positive number (e.g. 1.0, 2.5)"
          )
          return
        }

        const k = parseFloat(inputK)
        const n = parseFloat(outputN)

        if (k > n) {
          cogoToast.warn("Input (K) cannot be greater than Output (N)")
          return
        }
      }
    }

    const elementData = {
      structureId,
      parentId,
      name: elementValue,
      type: elementType,
      eventType: elementType === "event" ? eventType : null,
      gateType: elementType === "gate" ? gateType : null,
      eventValue: elementType === "event" ? eventValue : null,
      eventValueType: elementType === "event" ? eventValueType : null,
      missionTime:
        elementType === "event" && eventValueType === "λ"
          ? Number(missionTime)
          : null,
      mttr:
        elementType === "event" && eventType === "basic" ? Number(mttr) : null,
      description,
      inputK:
        elementType === "gate" && gateType === "voting-or"
          ? Number(inputK) || null
          : null,
      outputN:
        elementType === "gate" && gateType === "voting-or"
          ? Number(outputN) || null
          : null,
    }

    try {
      if (isEdit && elementId) {
        await dispatch(
          updateElement({
            id: elementId,
            updateElementData: {
              name: elementValue,
              type: elementType,
              eventType: elementType === "event" ? eventType : null,
              gateType: elementType === "gate" ? gateType : null,
              eventValue: elementType === "event" ? eventValue : null,
              eventValueType: elementType === "event" ? eventValueType : null,
              missionTime:
                elementType === "event" && eventValueType === "λ"
                  ? Number(missionTime)
                  : null,
              mttr:
                elementType === "event" && eventType === "basic"
                  ? Number(mttr)
                  : null,
              description,
              inputK:
                elementType === "gate" && gateType === "voting-or"
                  ? Number(inputK) || null
                  : null,
              outputN:
                elementType === "gate" && gateType === "voting-or"
                  ? Number(outputN) || null
                  : null,
            },
          })
        ).unwrap()

        cogoToast.success("Element updated successfully!")
      } else {
        await dispatch(createElement(elementData)).unwrap()
        cogoToast.success("Element added successfully!")
      }
      setChildModalVisible(false)
      setElementValue("")
      onClose()
      onSuccess()
    } catch (error) {
      cogoToast.error(
        "Error saving element: " + (error.message || "Unknown error")
      )
    }
  }

  const handleEditStructureSubmit = async () => {
    if (!structureName.trim()) {
      cogoToast.error("Structure name cannot be empty")
      return
    }
    await dispatch(
      updateStructure({ id: structureId, updateData: { name: structureName } })
    ).unwrap()
    cogoToast.success("Structure name updated successfully!")
    setEditStructureModalVisible(false)
    onSuccess()
  }

  const handleDeleteConfirm = async () => {
    setDeleting(true)
    try {
      if (!deleteRecordId) {
        await dispatch(deleteElement(elementId)).unwrap()
        cogoToast.success("Element deleted successfully!")
      } else {
        await dispatch(deleteRecord(deleteRecordId)).unwrap()
        cogoToast.success("Record deleted successfully!")
      }

      setDeleteModalVisible(false)
      setDeleteRecordId(null)
      onSuccess()
      onClose()
    } catch (error) {
      cogoToast.error("Error deleting: " + (error.message || "Unknown error"))
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteButtonClick = recordId => {
    if (recordId) {
      setDeleteRecordId(recordId)
    } else {
      setDeleteRecordId(null)
    }
    setDeleteModalVisible(true)
  }

  useEffect(() => {
    if (elementId) {
      dispatch(getRecordsByElement(elementId))
        .unwrap()
        .then(data => {
          if (data.length > 0) {
            setRecordExists(true)
          } else {
            setRecordExists(false)
          }
        })
        .catch(() => setRecordExists(false))
    }
  }, [elementId, dispatch])

  useEffect(() => {
    if (isEdit && elementId) {
      dispatch(fetchElementById(elementId)).then(action => {
        const element = action.payload
        setElementValue(element.name)
        setElementType(element.type || "event")
        setDescription(element.description || "")

        if (element.type === "event") {
          setEventType(element.eventType || "")
          setEventValue(element.eventValue || "")
          seEventValueType(element.eventValueType || "")
          setMissionTime(element.missionTime || "")
          setMttr(element.mttr || "")
          setGateType("")
          setInputK("")
          setOutputN("")
        } else if (element.type === "gate") {
          setGateType(element.gateType || "")
          setInputK(element.inputK || "")
          setOutputN(element.outputN || "")
          setEventType("")
          setEventValue("")
          seEventValueType("")
          setMissionTime("")
          setMttr("")
        }
      })
    }
  }, [isEdit, elementId, dispatch])

  useEffect(() => {
    if (eventType === "undeveloped" || eventType === "conditional") {
      if (eventValueType === "λ") seEventValueType("")
      setMissionTime("")
    }

    if (eventType !== "basic") {
      setMttr("")
    }
  }, [eventType])
  const handleKeyPress = e => {
    if (e?.key === "Enter") {
      handleModalSubmit()
    }
  }

  const handleViewEditRecord = actionType => {
    switch (actionType) {
      case "add":
        setActionType("add")
        setElementValue(initialStructureName)
        setModalVisible(true)
        setIsEdit(false)
        break
      case "view":
        setActionType("view")
        setModalVisible(true)
        setIsEdit(false)
        break
      case "edit":
        setActionType("edit")
        setModalVisible(true)
        setIsEdit(true)
        break
      default:
        setModalVisible(false)
        break
    }
  }

  const handleKeyPressEditStructure = e => {
    if (e?.key === "Enter") {
      handleEditStructureSubmit()
    }
  }

  const handleFileSelection = file => {
    if (!file) {
      cogoToast.error("Please select a valid structure!")
      return
    }

    setIsImportModalOpen(false)
    handleFileUpload(file)
  }

  const handleFileUpload = async file => {
    try {
      setIsLoading(true)

      await dispatch(uploadFile({ file, userId, structureId })).unwrap()

      cogoToast.success("Structure uploaded successfully!")

      onSuccess()
    } catch (err) {
      cogoToast.error("Failed to upload structure.")
    } finally {
      setIsLoading(false)
    }
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
        className={`${
          roleAccess.canManage ||
          roleAccess.canEdit ||
          (roleAccess.canComment && wbs !== "1")
            ? "bg-white border border-gray-300 rounded-lg shadow-md p-3 w-auto z-50"
            : ""
        }`}
      >
        <div className="flex flex-wrap gap-2 items-center justify-start ">
          {wbs === "1" && roleAccess.canManage && (
            <>
              {/* Import Structure */}
              <Tooltip label="Import Structure">
                <button
                  onClick={() =>
                    handleFeatureClick(canImportStructure, () =>
                      setIsImportModalOpen(true)
                    )
                  }
                  className="hover:bg-gray-100 rounded-full cursor-pointer p-2 focus:ring-2 focus:ring-custom-main"
                >
                  <PiTreeStructureFill size={24} className="text-custom-main" />
                </button>
              </Tooltip>

              {/* Edit Structure */}
              <Tooltip label="Edit Structure">
                <button
                  onClick={() => setEditStructureModalVisible(true)}
                  className="hover:bg-gray-100 rounded-full cursor-pointer p-2 focus:ring-2 focus:ring-custom-main"
                >
                  <RiEditCircleFill size={24} className="text-custom-main" />
                </button>
              </Tooltip>
            </>
          )}

          {wbs !== "1" &&
          ((!recordExists && (roleAccess.canEdit || roleAccess.canManage)) ||
            roleAccess.canComment) ? (
            <Tooltip label="Add Record">
              <button
                onClick={() =>
                  handleFeatureClick(canTagRecord, () =>
                    handleViewEditRecord("add")
                  )
                }
                aria-label="Add Record"
                className="hover:bg-gray-100 rounded-full cursor-pointer p-2 focus:ring-2 focus:ring-custom-main"
              >
                <RiPlayListAddFill size={24} className="text-custom-main" />
              </button>
            </Tooltip>
          ) : null}

          {recordExists && (
            <>
              <Tooltip label="View Record">
                <button
                  onClick={() => handleViewEditRecord("edit")}
                  aria-label="View Record"
                  className={
                    "hover:bg-gray-100 rounded-full cursor-pointer p-2 focus:ring-2 focus:ring-custom-main"
                  }
                >
                  <GiBrassEye size={24} className="text-custom-main" />
                </button>
              </Tooltip>
              <Tooltip label="Delete Record">
                <button
                  onClick={() => handleDeleteButtonClick(recordId)}
                  aria-label="Delete Record"
                  className={
                    "hover:bg-gray-100 rounded-full cursor-pointer p-2 focus:ring-2 focus:ring-custom-main"
                  }
                >
                  <IoIosRemoveCircle size={24} className="text-custom-main" />
                </button>
              </Tooltip>
            </>
          )}

          {roleAccess.canEdit && (
            <Tooltip label="Add Element">
              <button
                onClick={() => {
                  setChildModalVisible(true)
                  setIsEdit(false)
                }}
                className="hover:bg-gray-100 rounded-full cursor-pointer p-2 focus:ring-2 focus:ring-custom-main"
              >
                <FaCirclePlus size={24} className="text-custom-main" />
              </button>
            </Tooltip>
          )}

          {wbs !== "1" && roleAccess.canEdit && (
            <Tooltip label="Edit Element">
              <button
                onClick={() => {
                  setChildModalVisible(true)
                  setIsEdit(true)
                }}
                className="hover:bg-gray-100 rounded-full cursor-pointer p-2 focus:ring-2 focus:ring-custom-main"
              >
                <FaEdit size={24} className="text-custom-main" />
              </button>
            </Tooltip>
          )}

          {/* Delete Element */}
          {wbs !== "1" && roleAccess.canEdit && (
            <Tooltip label="Delete Element">
              <button
                onClick={() => handleDeleteButtonClick(null)}
                className="hover:bg-gray-100 rounded-full cursor-pointer p-2 focus:ring-2 focus:ring-custom-main"
              >
                <IoTrash size={24} className="text-custom-main" />
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {modalVisible && (
        <AddQuillModal
          structureId={structureId}
          position={{ x: window.innerWidth / 2, y: window.innerHeight / 2 }}
          onClose={() => setModalVisible(false)}
          onSuccess={onClose}
          fetchData={onSuccess}
          elementValue={elementValue}
          elementId={elementId}
          isEdit={isEdit}
          actionType={actionType}
          text={actionType === "view" ? "View" : isEdit ? "View / Edit" : "Add"}
          submitText={actionType === "view" ? "Edit" : "Save"}
          cancelText="Cancel"
          recordId={recordId}
        />
      )}

      {childModalVisible && (
        <ModalComponent
          isOpen={childModalVisible}
          onClose={() => setChildModalVisible(false)}
          title={isEdit ? "Edit Element" : "Add Element"}
          onImportAsJSON={() => setIsImportModalOpen(true)}
          showBottomButton={true}
          disabled={!elementValue.trim()}
          onSubmit={handleModalSubmit}
          submitText={isEdit ? "Edit" : "Save"}
          cancelText="Cancel"
        >
          <>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Element Name
              </label>
              <input
                type="text"
                value={elementValue}
                onChange={e => setElementValue(e.target.value)}
                onKeyDown={handleKeyPress}
                ref={focusRef}
                placeholder="Enter element name"
                className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            {renderType !== "markmap" && structureType !== "default" && (
              <div className="flex items-center gap-4 mb-4">
                <label className="text-sm font-semibold text-gray-700 w-28">
                  Element Type:
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="elementType"
                    value="event"
                    checked={elementType === "event"}
                    onChange={() => setElementType("event")}
                    className="accent-custom-main"
                  />
                  <span className="text-gray-700">Event</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="elementType"
                    value="gate"
                    checked={elementType === "gate"}
                    onChange={() => setElementType("gate")}
                    className="accent-custom-main"
                  />
                  <span className="text-gray-700">Gate</span>
                </label>
              </div>
            )}

            {renderType !== "markmap" &&
              elementType === "event" &&
              structureType !== "default" && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Event Type <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={eventType}
                      onChange={e => setEventType(e.target.value)}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Event Type</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="basic">Basic</option>
                      <option value="transfer">Transfer</option>
                      <option value="conditional">Conditional</option>
                      <option value="undeveloped">Undeveloped</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Event Value
                    </label>
                    <input
                      type="text"
                      value={eventValue}
                      onChange={e => setEventValue(e.target.value)}
                      placeholder="Enter event code (e.g., E-001)"
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Event Value Type <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={eventValueType}
                      onChange={e => seEventValueType(e.target.value)}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Value Type</option>
                      <option
                        value="λ"
                        disabled={
                          eventType === "conditional" ||
                          eventType === "undeveloped"
                        }
                      >
                        Rate (λ)
                      </option>
                      <option value="P">Probability (P)</option>
                    </select>
                  </div>
                  {eventValueType === "λ" && (
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Mission Time (t) <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        value={missionTime}
                        onChange={e => setMissionTime(e.target.value)}
                        placeholder="Enter mission time in hours"
                        className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                  {eventType === "basic" && (
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        MTTR (Mean Time To Repair)
                      </label>
                      <input
                        type="number"
                        value={mttr}
                        onChange={e => setMttr(e.target.value)}
                        placeholder="Enter MTTR in hours"
                        className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </>
              )}

            {renderType !== "markmap" &&
              elementType === "gate" &&
              structureType !== "default" && (
                <>
                  <div className="flex items-center gap-4 mb-4">
                    <label className="text-sm font-semibold text-gray-700 w-28">
                      Gate Type:
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gateType"
                        value="AND"
                        checked={gateType === "AND"}
                        onChange={() => setGateType("AND")}
                        className="accent-custom-main"
                      />
                      <span className="text-gray-700">AND</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gateType"
                        value="OR"
                        checked={gateType === "OR"}
                        onChange={() => setGateType("OR")}
                        className="accent-custom-main"
                      />
                      <span className="text-gray-700">OR</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gateType"
                        value="voting-or"
                        checked={gateType === "voting-or"}
                        onChange={() => setGateType("voting-or")}
                        className="accent-custom-main"
                      />
                      <span className="text-gray-700">VOTE</span>
                    </label>
                  </div>

                  {gateType === "voting-or" && (
                    <>
                      <div className="flex gap-4 mb-4">
                        <div className="w-1/2">
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Input (K) <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={inputK}
                            onChange={e => setInputK(e.target.value)}
                            placeholder="Enter input K (e.g. 2.0)"
                            className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="w-1/2">
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Output (N) <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={outputN}
                            onChange={e => setOutputN(e.target.value)}
                            placeholder="Enter input N (e.g 3.0) (≥ K)"
                            className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

            {(elementType === "event" || elementType === "gate") &&
              renderType !== "markmap" &&
              structureType !== "default" && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Enter description"
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
          </>
        </ModalComponent>
      )}

      {/* Edit Structure Modal */}
      {editStructureModalVisible && (
        <ModalComponent
          isOpen={editStructureModalVisible}
          onClose={() => setEditStructureModalVisible(false)}
          title="Edit Structure Name"
          disabled={!structureName.trim()}
          onSubmit={handleEditStructureSubmit}
          submitText="Update"
          cancelText="Cancel"
        >
          <InputField
            label="Edit Structure Name"
            name="structureName"
            focusRef={focusRef}
            disabled={!structureName.trim()}
            value={structureName}
            onKeyDown={handleKeyPressEditStructure}
            onChange={e => setStructureName(e.target.value)}
            placeholder="Enter structure name"
          />
        </ModalComponent>
      )}
      {deleteModalVisible && (
        <DeleteModal
          isOpen={deleteModalVisible}
          title={deleteRecordId ? "Record" : "Element"}
          onClose={() => setDeleteModalVisible(false)}
          onConfirm={handleDeleteConfirm}
          loading={deleting}
        />
      )}
      {isImportModalOpen && (
        <ImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          title={"Import Structure"}
          format={".json, .csv, .xls, .xlsx"}
          buttonText={"Import"}
          isLoading={isLoading}
          handleFileSelection={file => handleFileSelection(file)}
          onSuccess={onSuccess}
          showDownloadSample={true}
        />
      )}
    </>
  )
}

export default NodeModal
