import cogoToast from "@successtar/cogo-toast"
import { useState } from "react"
import { IoTrash } from "react-icons/io5"
import { useDispatch } from "react-redux"
import Cookies from "js-cookie"
import { Link } from "react-router-dom"
import useOutsideClick from "../../hooks/useOutsideClick"
import { deleteStructure } from "../../redux/slices/structures"
import DeleteModal from "../modals/DeleteModal"
import RendererModal from "../modals/RendererModal"
import Avatar from "react-avatar"

const Card = ({
  title,
  imageUrl,
  footerTitle,
  footerSubtitle,
  customTextColor = "text-custom-main",
  username,
  structureId,
  onSuccess,
  structureType = "default",
}) => {
  const dispatch = useDispatch()
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [dropdownVisible, setDropdownVisible] = useState(false)
  const [rendererModalVisible, setRendererModalVisible] = useState(false)

  const handleDeleteStructure = () => {
    setDeleteModalVisible(true)
    setDropdownVisible(false)
  }

  const handleConfirmDelete = () => {
    dispatch(deleteStructure(structureId))
      .then(() => {
        setDeleteModalVisible(false)
        cogoToast.success("Structure deleted successfully!")
        onSuccess()
      })
      .catch(() => {
        cogoToast.error("Failed to delete the structure.")
      })
  }

  const dropdownRef = useOutsideClick(() => setDropdownVisible(false))

  const handleRendererSelect = renderer => {
    setRendererModalVisible(false)
    window.location.href = `/app/s/${username}/${structureId}?renderer=${renderer}`
  }

  return (
    <>
      <div className="relative bg-white rounded-lg shadow-md hover:shadow-lg border border-gray-200 cursor-pointer">
        <div className="flex flex-col">
          <div
            onClick={() => setRendererModalVisible(true)}
            className="w-full h-48 bg-[radial-gradient(circle,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:14px_14px]"
          >
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover rounded-t-lg"
              loading="lazy"
            />
          </div>

          <div className="flex flex-col justify-between flex-grow p-3 space-y-3 border-t border-gray-300">
            <Link to={`/app/s/${username}/${structureId}`}>
              <h3
                className={`text-lg capitalize font-semibold truncate ${customTextColor}`}
                title={title}
              >
                {title}
              </h3>
            </Link>

            <div className="flex items-center justify-between mt-2">
              <Link to="#" className="flex items-center space-x-2">
                <Avatar
                  name={Cookies.get("displayName") || "User"}
                  size="36"
                  round={true}
                  className="text-lg"
                />
                <div>
                  <p className="text-sm font-medium text-custom-main truncate">
                    {footerTitle}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {footerSubtitle}
                  </p>
                </div>
              </Link>

              <div className="relative z-20" ref={dropdownRef}>
                <div
                  onClick={() => setDropdownVisible(prev => !prev)}
                  className="w-8 h-8 rounded-full bg-custom-main text-white flex items-center justify-center cursor-pointer"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <circle cx="10" cy="4" r="2" />
                    <circle cx="10" cy="10" r="2" />
                    <circle cx="10" cy="16" r="2" />
                  </svg>
                </div>

                {dropdownVisible && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white border border-gray-200 rounded-md shadow-md w-48 z-50">
                    {/* <div
                      className="px-4 py-2 hover:bg-gray-100 flex items-center cursor-pointer"
                      onClick={() => setDropdownVisible(false)}
                    >
                      <HiInformationCircle className="w-4 h-4 mr-2 text-gray-600" />
                      <span className="text-sm text-gray-600">
                        Intro to Atlas
                      </span>
                    </div>
                    <div
                      className="px-4 py-2 hover:bg-gray-100 flex items-center cursor-pointer"
                      onClick={() => setDropdownVisible(false)}
                    >
                      <HiSupport className="w-4 h-4 mr-2 text-gray-600" />
                      <span className="text-sm text-gray-600">Help Center</span>
                    </div>
                    */}
                    <div
                      className="px-4 py-2 text-sm hover:bg-gray-100 font-semibold flex items-center cursor-pointer text-red-700"
                      onClick={handleDeleteStructure}
                    >
                      <IoTrash className="w-5 h-5 mr-2" />
                      <span>Delete Structure</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {deleteModalVisible && (
        <DeleteModal
          isOpen={deleteModalVisible}
          title={"Structure"}
          onClose={() => setDeleteModalVisible(false)}
          onConfirm={handleConfirmDelete}
        />
      )}

      <RendererModal
        isOpen={rendererModalVisible}
        onClose={() => setRendererModalVisible(false)}
        onSelect={handleRendererSelect}
        structureType={structureType}
      />
    </>
  )
}

export default Card
