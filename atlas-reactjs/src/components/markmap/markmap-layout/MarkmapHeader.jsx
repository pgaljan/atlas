import React, { useState } from "react"
import { BiRedo, BiSearch, BiUndo, BiUser } from "react-icons/bi"
import { FaUserPlus } from "react-icons/fa"
import { RiDownloadCloud2Line } from "react-icons/ri"
import { TbWorldUpload } from "react-icons/tb"
import { VscGitPullRequestCreate } from "react-icons/vsc"
import { Link } from "react-router-dom"
import ImportModal from "../../modals/ImportModal"
import ShareModal from "../../modals/ShareModal"
import UserPopover from "../../modals/UserPopover"
import Tooltip from "../../tooltip/Tooltip"
import cogoToast from "@successtar/cogo-toast"

const MarkmapHeader = ({
  undo,
  redo,
  canUndo,
  canRedo,
  showWbs,
  setShowWbs,
  onSearch,
}) => {
  const [isUserPopoverVisible, setIsUserPopoverVisible] = useState(false)
  const [title, setTitle] = useState("Untitled")
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("Level: ")

  const handleTitleChange = e => {
    setTitle(e.target.value)
  }

  const handleSearchChange = e => {
    const value = e.target.value

    if (!value.startsWith("Level: ")) return
    const afterColon = value?.slice(7)
    if (afterColon === "0") {
      // Prevent "0" from being searchable
      cogoToast?.error("Level 0 is not searchable.")
      return
    }
    if (afterColon && !/^\d*$/.test(afterColon)) return

    setSearchValue(value)

    // Pass the numeric value (if present) to the onSearch callback
    const level = afterColon.trim()
    if (level) {
      onSearch(level)
    } else {
      onSearch("")
    }
  }

  const toggleShareModal = () => setIsShareModalOpen(!isShareModalOpen)
  const toggleImportModal = () => setIsImportModalOpen(!isImportModalOpen)

  return (
    <div className="absolute top-4 left-0 w-full flex items-center px-4 py-2 z-50">
      <div className="flex items-center w-full justify-between">
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-200">
          <Link to="/home">
            <h1 className="text-2xl font-bold text-[#660000]">ATLAS</h1>
          </Link>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            className="text-md font-medium w-auto max-w-20 pl-1 rounded-md py-1 text-custom-main truncate bg-slate-200 border-1 border-transparent focus:border-custom-main outline-none focus:ring-2 focus:ring-custom-main transition-all"
          />

          <Tooltip label="Undo">
            <button
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Undo"
              onClick={undo}
              disabled={!canUndo}
            >
              <BiUndo
                size={24}
                className={canUndo ? "text-custom-main" : "text-gray-400"}
              />
            </button>
          </Tooltip>

          <Tooltip label="Redo">
            <button
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Redo"
              onClick={redo}
              disabled={!canRedo}
            >
              <BiRedo
                size={24}
                className={canRedo ? "text-custom-main" : "text-gray-400"}
              />
            </button>
          </Tooltip>

          <Tooltip label="Import Backups">
            <button
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Import Backups"
              onClick={toggleImportModal}
            >
              <VscGitPullRequestCreate size={24} className="text-custom-main" />
            </button>
          </Tooltip>

          <Tooltip label="Create Backup">
            <button
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Create Backup"
            >
              <RiDownloadCloud2Line size={26} className="text-custom-main" />
            </button>
          </Tooltip>

          <Tooltip label="Save">
            <button
              className="p-3 hover:bg-gray-100 rounded-full"
              aria-label="Save"
            >
              <TbWorldUpload size={24} className="text-custom-main" />
            </button>
          </Tooltip>

          <div className="relative flex items-center">
            <input
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              className="bg-white border border-gray-300 rounded-l-md p-2 w-64 sm:w-60 shadow-lg pl-10"
            />
            <BiSearch size={24} className="absolute left-2 text-gray-500" />
          </div>
        </div>

        <div className="flex items-center space-x-3 shadow-lg p-2 bg-slate-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <span
              className={`text-sm font-medium ${
                showWbs ? "text-custom-main" : "text-gray-700"
              }`}
            >
              Show WBS
            </span>

            <label
              className="relative inline-flex items-center cursor-pointer"
              htmlFor="show-wbs-toggle"
            >
              <input
                id="show-wbs-toggle"
                type="checkbox"
                checked={showWbs}
                onChange={e => setShowWbs(e.target.checked)}
                className="sr-only peer"
              />
              <div
                className={`w-12 h-6 rounded-full transition-all ${
                  showWbs
                    ? "bg-custom-main border-none"
                    : "bg-white border border-gray-300"
                }`}
              ></div>
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white border border-gray-600 rounded-full peer-checked:translate-x-6 peer-checked:border-custom-main transition-transform
                ${showWbs ? "" : "!bg-custom-main"}
                `}
              ></div>
            </label>
          </div>

          <Tooltip label="Profile">
            <button
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Profile"
              onClick={() => setIsUserPopoverVisible(!isUserPopoverVisible)}
            >
              <BiUser size={24} className="text-custom-main" />
            </button>
          </Tooltip>

          <button
            onClick={toggleShareModal}
            className="flex items-center bg-custom-main text-white px-4 py-2 rounded-lg"
          >
            <FaUserPlus size={20} className="mr-2" />
            Share
          </button>
        </div>
      </div>
      {isUserPopoverVisible && <UserPopover />}
      <ShareModal isOpen={isShareModalOpen} onClose={toggleShareModal} />
      <ImportModal isOpen={isImportModalOpen} onClose={toggleImportModal} />
    </div>
  )
}

export default MarkmapHeader
