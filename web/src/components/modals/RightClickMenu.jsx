import cogoToast from "@successtar/cogo-toast"
import { useState } from "react"
import { FaFilePdf, FaFileWord, FaTrash } from "react-icons/fa"
import { PiFileHtmlBold } from "react-icons/pi"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import useFeatureFlag from "../../hooks/useFeatureFlag"
import { deleteStructure } from "../../redux/slices/structures"
import DeleteModal from "./DeleteModal"

const RightClickMenu = ({
  position,
  onOptionSelect,
  onClose,
  structureId,
  permission,
  role,
  access,
}) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Feature flag checks
  const canExportHtml = useFeatureFlag("Export to HTML/Markdown")
  const canExportDOC = useFeatureFlag("Export to DOC/PDF")
  const canExportPDF = useFeatureFlag("Export to DOC/PDF")
  const [deleting, setDeleting] = useState(false)
  const handleFeatureClick = (canAccess, action) => {
    if (canAccess) {
      action()
    } else {
      navigate(`?plan=upgrade-to-premium`)
    }
  }

  const handleMoveToTrash = e => {
    e.stopPropagation()
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    setDeleting(true)

    dispatch(deleteStructure(structureId))
      .then(() => {
        cogoToast.success("Structure deleted successfully!")
        setIsDeleteModalOpen(false)
        onClose()
        navigate("/app/dashboard")
      })
      .catch(() => {
        cogoToast.error("Failed to delete the structure. Please try again.")
      })
      .finally(() => {
        setDeleting(false)
      })
  }

  const handleCloseModal = () => {
    setIsDeleteModalOpen(false)
  }

  return (
    <>
      <div
        className="absolute bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-50"
        style={{ top: position.y, left: position.x }}
      >
        <button
          disabled={!access.canExport}
          className={`flex items-center gap-2 px-3 py-2 w-full text-left rounded-md transition-colors duration-200
    ${
      access.canExport
        ? "hover:bg-gray-100 text-gray-800 cursor-pointer"
        : "text-gray-400 cursor-not-allowed bg-gray-50"
    }`}
          onClick={() =>
            handleFeatureClick(canExportHtml, () => {
              onOptionSelect("exportHtml")
              onClose()
            })
          }
        >
          <PiFileHtmlBold /> Export as HTML
        </button>

        <button
          disabled={!access.canExport}
          className={`flex items-center gap-2 px-3 py-2 w-full text-left rounded-md transition-colors duration-200
    ${
      access.canExport
        ? "hover:bg-gray-100 text-gray-800 cursor-pointer"
        : "text-gray-400 cursor-not-allowed bg-gray-50"
    }`}
          onClick={() =>
            handleFeatureClick(canExportDOC, () => {
              onOptionSelect("exportDoc")
              onClose()
            })
          }
        >
          <FaFileWord /> Export as DOC
        </button>

        {/* <button
          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 w-full text-left rounded-md transition-colors duration-200"
          onClick={() =>
            handleFeatureClick(canExportPDF, () => {
              onOptionSelect("exportPdf");
              onClose();
            })
          }
        >
          <FaFilePdf /> Export as PDF
        </button> */}

        <hr className="border-t border-gray-200 my-2" />

        <button
          disabled={!access.canManage}
          className={`flex items-center gap-2 px-3 py-2 w-full text-left rounded-md transition-colors duration-200
    ${
      access.canManage
        ? "hover:bg-gray-100 text-red-500 cursor-pointer"
        : "text-gray-300 cursor-not-allowed bg-gray-50"
    }`}
          onClick={handleMoveToTrash}
        >
          <FaTrash className="text-red-500" /> Move to Trash
        </button>
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Structure"
        loading={deleting}
      />
    </>
  )
}

export default RightClickMenu
