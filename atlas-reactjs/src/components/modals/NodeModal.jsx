import cogoToast from "@successtar/cogo-toast";
import Cookies from "js-cookie";
import React, { useEffect, useRef, useState } from "react";
import { BiLink } from "react-icons/bi";
import { FaEdit } from "react-icons/fa";
import { FaCirclePlus } from "react-icons/fa6";
import { GiBrassEye } from "react-icons/gi";
import { IoIosRemoveCircle } from "react-icons/io";
import { IoTrash } from "react-icons/io5";
import { PiTreeStructureFill } from "react-icons/pi";
import { RiEditCircleFill, RiPlayListAddFill } from "react-icons/ri";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import useOutsideClick from "../../hooks/useOutsideClick";
import { updateStructure } from "../../redux/slices/structures";
import { uploadFile } from "../../redux/slices/upload-files";

import useFeatureFlag from "../../hooks/useFeatureFlag";
import {
  createElement,
  deleteElement,
  fetchElementById,
  updateElement,
} from "../../redux/slices/elements";
import { deleteRecord, getRecordsByElement } from "../../redux/slices/records";
import InputField from "../input-field/InputField";
import Tooltip from "../tooltip/Tooltip";
import AddQuillModal from "./AddQuillModal";
import DeleteModal from "./DeleteModal";
import ImportModal from "./ImportModal";
import ModalComponent from "./Modal";

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
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = Cookies.get("atlas_userId");
  const [isLoading, setIsLoading] = useState(false);
  const [deleteRecordId, setDeleteRecordId] = useState(null);
  const [recordExists, setRecordExists] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [childModalVisible, setChildModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [elementValue, setElementValue] = useState("");
  const [actionType, setActionType] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editStructureModalVisible, setEditStructureModalVisible] =
    useState(false);
  const [structureName, setStructureName] = useState(initialStructureName);

  // Feature flags
  const canImportStructure = useFeatureFlag("Import from Excel");
  const canTagRecord = useFeatureFlag("Rich Text Records");

  const handleFeatureClick = (canAccess, action) => {
    if (canAccess) {
      action();
    } else {
      navigate(`?plan=upgrade-to-premium`);
    }
  };

  const modalRef = useOutsideClick(() => {
    if (
      !isImportModalOpen &&
      !editStructureModalVisible &&
      !childModalVisible &&
      !modalVisible &&
      !deleteModalVisible
    ) {
      onClose();
    }
  });

  const focusRef = useRef(null);

  const handleModalSubmit = async () => {
    if (!elementValue.trim()) {
      cogoToast.error("Element title cannot be empty");
      return;
    }

    const elementData = {
      structureId,
      parentId,
      name: elementValue,
    };

    try {
      if (isEdit && elementId) {
        await dispatch(
          updateElement({
            id: elementId,
            updateElementData: elementValue,
          })
        ).unwrap();
        cogoToast.success("Element updated successfully!");
      } else {
        await dispatch(createElement(elementData)).unwrap();
        cogoToast.success("Element added successfully!");
      }
      setChildModalVisible(false);
      setElementValue("");
      onClose();
      onSuccess();
    } catch (error) {
      cogoToast.error(
        "Error saving element: " + (error.message || "Unknown error")
      );
    }
  };

  const handleEditStructureSubmit = async () => {
    if (!structureName.trim()) {
      cogoToast.error("Structure name cannot be empty");
      return;
    }
    await dispatch(
      updateStructure({ id: structureId, updateData: { name: structureName } })
    ).unwrap();
    cogoToast.success("Structure name updated successfully!");
    setEditStructureModalVisible(false);
    onSuccess();
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!deleteRecordId) {
        await dispatch(deleteElement(elementId)).unwrap();
        cogoToast.success("Element deleted successfully!");
      } else {
        await dispatch(deleteRecord(deleteRecordId)).unwrap();
        cogoToast.success("Record deleted successfully!");
      }
      setDeleteModalVisible(false);
      setDeleteRecordId(null);
      onClose();
      onSuccess();
    } catch (error) {
      cogoToast.error(
        "Error deleting element: " + (error.message || "Unknown error")
      );
    }
  };

  const handleDeleteButtonClick = (recordId) => {
    if (recordId) {
      setDeleteRecordId(recordId);
    } else {
      setDeleteRecordId(null);
    }
    setDeleteModalVisible(true);
  };

  // Fetch record to check if it exists
  useEffect(() => {
    if (elementId) {
      dispatch(getRecordsByElement(elementId))
        .unwrap()
        .then((data) => {
          if (data.length > 0) {
            setRecordExists(true);
          } else {
            setRecordExists(false);
          }
        })
        .catch(() => setRecordExists(false));
    }
  }, [elementId, dispatch]);

  useEffect(() => {
    if (isEdit && elementId) {
      dispatch(fetchElementById(elementId)).then((action) => {
        const element = action.payload;
        setElementValue(element.name);
      });
    }
  }, [isEdit, elementId, dispatch]);

  const handleKeyPress = (e) => {
    if (e?.key === "Enter") {
      handleModalSubmit();
    }
  };

  const handleViewEditRecord = (actionType) => {
    switch (actionType) {
      case "add":
        setActionType("add");
        setModalVisible(true);
        setIsEdit(false);
        break;
      case "view":
        setActionType("view");
        setModalVisible(true);
        setIsEdit(false);
        break;
      case "edit":
        setActionType("edit");
        setModalVisible(true);
        setIsEdit(true);
        break;
      default:
        setModalVisible(false);
        break;
    }
  };

  const handleKeyPressEditStructure = (e) => {
    if (e?.key === "Enter") {
      handleEditStructureSubmit();
    }
  };

  const handleFileSelection = (file) => {
    if (!file) {
      cogoToast.error("Please select a valid structure!");
      return;
    }

    setIsImportModalOpen(false);
    handleFileUpload(file);
  };

  const handleFileUpload = async (file) => {
    try {
      setIsLoading(true);

      await dispatch(uploadFile({ file, userId, structureId })).unwrap();

      cogoToast.success("Structure uploaded successfully!");

      onSuccess();
    } catch (err) {
      cogoToast.error("Failed to upload structure.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        ref={modalRef}
        style={{
          position: "fixed",
          left: position.x,
          top: position.y,
        }}
        className="bg-white border border-gray-300 rounded-lg shadow-md p-3 w-auto z-50"
      >
        <div className="flex flex-wrap gap-2 items-center justify-start ">
          {wbs === "1" && (
            <>
              <Tooltip label="Import Structure">
                <button
                  onClick={() =>
                    handleFeatureClick(canImportStructure, () =>
                      setIsImportModalOpen(true)
                    )
                  }
                  aria-label="Import Structure"
                  className="hover:bg-gray-100 rounded-full cursor-pointer p-2 focus:ring-2 focus:ring-custom-main"
                >
                  <PiTreeStructureFill size={24} className="text-custom-main" />
                </button>
              </Tooltip>
              <Tooltip label="Edit Structure">
                <button
                  onClick={() => setEditStructureModalVisible(true)}
                  aria-label="Edit Structure"
                  className="hover:bg-gray-100 rounded-full cursor-pointer p-2 focus:ring-2 focus:ring-custom-main"
                >
                  <RiEditCircleFill size={24} className="text-custom-main" />
                </button>
              </Tooltip>
            </>
          )}
          {wbs !== "1" && !recordExists && (
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
          )}

          {recordExists && (
            <>
              <Tooltip label="View Record">
                <button
                  onClick={() => handleViewEditRecord("edit")}
                  aria-label="View Record"
                  className="hover:bg-gray-100 rounded-full cursor-pointer p-2 focus:ring-2 focus:ring-custom-main"
                >
                  <GiBrassEye size={24} className="text-custom-main" />
                </button>
              </Tooltip>
              <Tooltip label="Delete Record">
                <button
                  onClick={() => handleDeleteButtonClick(recordId)}
                  aria-label="Delete Record"
                  className="hover:bg-gray-100 rounded-full cursor-pointer p-2 focus:ring-2 focus:ring-custom-main"
                >
                  <IoIosRemoveCircle size={24} className="text-custom-main" />
                </button>
              </Tooltip>
            </>
          )}
          {wbs !== "1" && (
            <Tooltip label="Edit Link">
              <button
                aria-label="Edit Link"
                className="hover:bg-gray-100 rounded-full cursor-pointer p-2 focus:ring-2 focus:ring-custom-main"
              >
                <BiLink size={24} className="text-custom-main" />
              </button>
            </Tooltip>
          )}

          <Tooltip label="Add Element">
            <button
              aria-label="Add Element"
              className="hover:bg-gray-100 rounded-full cursor-pointer p-2 focus:ring-2 focus:ring-custom-main"
              onClick={() => {
                setChildModalVisible(true);
                setIsEdit(false);
              }}
            >
              <FaCirclePlus size={24} className="text-custom-main" />
            </button>
          </Tooltip>
          {wbs !== "1" && (
            <Tooltip label="Edit Element">
              <button
                aria-label="Edit Element"
                className="hover:bg-gray-100 rounded-full cursor-pointer p-2 focus:ring-2 focus:ring-custom-main"
                onClick={() => {
                  setChildModalVisible(true);
                  setIsEdit(true);
                }}
              >
                <FaEdit size={24} className="text-custom-main" />
              </button>
            </Tooltip>
          )}
          {wbs !== "1" && (
            <Tooltip label="Delete Element">
              <button
                aria-label="Delete Element"
                className="hover:bg-gray-100 rounded-full cursor-pointer p-2 focus:ring-2 focus:ring-custom-main"
                onClick={() => handleDeleteButtonClick(null)}
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
          <InputField
            label="Element Name"
            name="elementName"
            value={elementValue}
            disabled={!elementValue.trim()}
            focusRef={focusRef}
            onKeyDown={handleKeyPress}
            onChange={(e) => setElementValue(e.target.value)}
            placeholder="Enter element name"
          />
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
            onChange={(e) => setStructureName(e.target.value)}
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
          handleFileSelection={(file) => handleFileSelection(file)}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
};

export default NodeModal;
