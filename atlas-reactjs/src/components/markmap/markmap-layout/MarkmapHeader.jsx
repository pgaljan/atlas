import React, { useState } from "react";
import {
  BiUndo,
  BiRedo,
  BiDownload,
  BiSearch,
  BiUser,
  BiCommentDetail,
  BiCollection,
  BiSave,
} from "react-icons/bi";
import Tooltip from "../../../containers/common/tooltip/Tooltip";
import MarkmapSidebar from "./MarkmapSidebar";
import UserPopover from "../../modals/UserPopover";

const MarkmapHeader = ({ showWbs, setShowWbs }) => {
  const [isUserPopoverVisible, setIsUserPopoverVisible] = useState(false);
  const [title, setTitle] = useState("Untitled");

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };
  return (
    <div className="absolute top-4 left-0 w-full flex items-center px-4 py-2 z-50">
      <MarkmapSidebar />
      <div className="flex items-center w-full justify-between">
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-200">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            className="text-md font-medium w-28 text-custom-main truncate bg-slate-200 border-1 border-transparent focus:border-custom-main outline-none focus:ring-2 focus:ring-custom-main transition-all"
          />

          <Tooltip label="Undo">
            <button
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Undo"
            >
              <BiUndo size={24} className="text-custom-main" />
            </button>
          </Tooltip>

          <Tooltip label="Redo">
            <button
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Redo"
            >
              <BiRedo size={24} className="text-custom-main" />
            </button>
          </Tooltip>

          <Tooltip label="Export">
            <button
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Export"
            >
              <BiDownload size={24} className="text-custom-main" />
            </button>
          </Tooltip>
          <Tooltip label="Save">
            <button
              className="p-3 hover:bg-gray-100 rounded-full"
              aria-label="Save"
            >
              <BiSave size={24} className="text-custom-main" />
            </button>
          </Tooltip>
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search..."
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
                onChange={(e) => setShowWbs(e.target.checked)}
                className="sr-only peer"
              />
              <div
                className={`w-12 h-6 rounded-full transition-all ${
                  showWbs
                    ? "bg-custom-main border-none"
                    : "bg-white border border-gray-300"
                }`}
              ></div>
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white border border-gray-600 rounded-full peer-checked:translate-x-6 peer-checked:border-custom-main transition-transform"></div>
            </label>
          </div>

          <Tooltip label="Comments">
            <button
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Comments"
            >
              <BiCommentDetail size={24} className="text-custom-main" />
            </button>
          </Tooltip>

          <Tooltip label="Users">
            <button
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Users"
              onClick={() => setIsUserPopoverVisible(!isUserPopoverVisible)}
            >
              <BiUser size={24} className="text-custom-main" />
            </button>
          </Tooltip>

          <Tooltip label="Outline">
            <button
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Outline"
            >
              <BiCollection size={24} className="text-custom-main" />
            </button>
          </Tooltip>

          <button className="flex items-center bg-custom-main text-white px-4 py-2 rounded-lg">
            <BiUser size={20} className="mr-2" />
            Share
          </button>
        </div>
      </div>

      {/* User Popover */}
      {isUserPopoverVisible && <UserPopover />}
    </div>
  );
};

export default MarkmapHeader;
