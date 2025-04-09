import React, { useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { FiSearch } from "react-icons/fi";
import Tooltip from "../../components/tooltip/Tooltip";
import ModalComponent from "../modals/Modal";

const GenericTable = ({
  title,
  tabs = [],
  enableSearch = false,
  columns = [],
  data = [],
  emptyState = {},
  actions = null,
  buttons = [],
  showId,
}) => {
  const [activeTab, setActiveTab] = useState(tabs ? tabs[0]?.key : null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Filter data based on active tab
  const filteredData =
    activeTab === "pending"
      ? data.filter((item) => item.status === "pending")
      : data;

  const handleZoomIn = () => {
    setZoomLevel((prevZoom) => Math.min(prevZoom + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prevZoom) => Math.max(prevZoom - 0.1, 1));
  };

  const getStatusStyle = (row) => {
    if (row.status === "accepted") {
      return "bg-green-100 text-green-800";
    }
    const isExpired = new Date(row.expire) < new Date();
    return isExpired
      ? "bg-red-100 text-red-800"
      : "bg-orange-100 text-orange-800";
  };

  const getStatusText = (row) => {
    if (row.status === "accepted") return "Accepted";
    const isExpired = new Date(row.expire) < new Date();
    return isExpired ? "Expired" : "Pending";
  };

  return (
    <>
      {/* Image Modal */}
      <ModalComponent
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        onSubmit={null}
        title="Image Preview"
      >
        {selectedImage && (
          <div className="relative">
            <img
              src={selectedImage}
              alt="Preview"
              className="w-full h-auto rounded-lg"
              style={{
                transform: `scale(${zoomLevel})`,
                transition: "transform 0.3s ease",
              }}
            />
            <div className="fixed bottom-3 right-4 p-2 flex items-center gap-2 rounded-[4px] shadow-md">
              <button
                onClick={handleZoomIn}
                className="text-[20px] text-black font-bold"
              >
                <FaPlus />
              </button>
              <button
                onClick={handleZoomOut}
                className="text-[20px] text-black font-bold"
              >
                <FaMinus />
              </button>
            </div>
          </div>
        )}
      </ModalComponent>

      {filteredData?.length === 0 && activeTab != "pending" ? (
        <div className="flex h-screen flex-col text-center p-6">
          <div className="flex flex-col items-center justify-center flex-grow">
            <div className="flex items-center justify-center bg-white rounded-full w-28 h-28 mb-4">
              {emptyState.icon}
            </div>
            <h2 className="text-2xl font-bold text-custom-text-grey mb-4">
              {emptyState.title}
            </h2>
            <p className="text-lg text-custom-text-grey">
              {emptyState.description}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-[18px] bg-custom-background-white h-auto max-h-[90%] shadow-md">
          <h1 className="text-[24px] font-bold text-black">{title}</h1>
          {tabs && (
            <div className="flex items-center mb-3">
              {tabs?.map((tab) => (
                <button
                  key={tab?.key}
                  className={`pr-4 py-2 font-semibold transition-colors ${
                    activeTab === tab?.key
                      ? "text-custom-text-heading"
                      : "text-custom-text-grey"
                  }`}
                  onClick={() => setActiveTab(tab?.key)}
                >
                  {tab?.label}
                  <hr
                    className={`mt-1 transition-all ${
                      activeTab === tab?.key
                        ? "border-custom-main"
                        : "border-transparent"
                    } border-2`}
                  />
                </button>
              ))}
            </div>
          )}
          {enableSearch && (
            <div className="flex items-center justify-between mb-4">
              <div className="relative w-full max-w-md">
                <FiSearch className="absolute top-3 left-3 text-custom-text-grey" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 max-w-[60%] border-2 rounded-lg focus:border-custom-main focus:outline-none"
                />
              </div>
              <div className="flex space-x-2">
                {buttons?.map((button, index) => (
                  <button
                    key={index}
                    className={`px-4 py-2 rounded-lg hover:bg-opacity-90 ${
                      button?.className || "bg-custom-main text-white"
                    }`}
                  >
                    {button?.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-custom-text-heading border-b border-gray-300">
                  {showId && <th className="px-4 py-2">#Id</th>}
                  {columns?.map((col) => (
                    <th key={col?.key} className="px-4 py-2">
                      <div className="flex items-center">
                        {col?.label}
                        {Array?.isArray(col?.icon)
                          ? col?.icon?.map((icon, index) => (
                              <span key={index} className="ml-2">
                                {icon}
                              </span>
                            ))
                          : React.isValidElement(col?.icon) && (
                              <span className="ml-2">{col?.icon}</span>
                            )}
                      </div>
                    </th>
                  ))}
                  {actions && <th className="px-4 py-2">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredData?.length === 0 ? (
                  activeTab === "pending" ? (
                    <tr>
                      <td
                        colSpan={columns.length + (showId ? 1 : 0)}
                        className="text-center p-6"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <p className="text-lg text-custom-text-grey">
                            There are currently no pending invitations.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : null
                ) : (
                  filteredData?.map((row, rowIndex) => (
                    <tr
                      key={row?.id || rowIndex}
                      className={`border-b border-gray-300 ${
                        rowIndex % 2 === 0 ? "bg-white" : "bg-gray-100"
                      }`}
                    >
                      {showId && (
                        <td className="px-4 py-2">
                          {row?.id?.substring(0, 8)}...
                        </td>
                      )}
                      {columns?.map((col) => (
                        <td key={col?.key} className="px-4 py-2">
                          <div className="flex items-center">
                            {col?.key === "fileUrl" ? (
                              [
                                "image/png",
                                "image/jpeg",
                                "image/jpg",
                                "image/webp",
                              ].includes(row?.fileType) ? (
                                <img
                                  src={row[col?.key]}
                                  alt="Uploaded File"
                                  className="w-12 h-12 object-cover cursor-pointer rounded-md shadow-sm"
                                  onClick={() =>
                                    setSelectedImage(row[col?.key])
                                  }
                                />
                              ) : (
                                <a
                                  href={row[col?.key]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1 hover:underline text-blue-500"
                                >
                                  Download
                                </a>
                              )
                            ) : col?.key === "updatedAt" ? (
                              <span>
                                {row[col?.key]
                                  ? new Date(row[col?.key]).toLocaleString(
                                      "en-US",
                                      {
                                        month: "2-digit",
                                        day: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                      }
                                    )
                                  : "N/A"}
                              </span>
                            ) : col?.key === "status" ? (
                              <span
                                className={`px-2 py-1 rounded-full text-sm ${getStatusStyle(
                                  row
                                )}`}
                              >
                                {getStatusText(row)}
                              </span>
                            ) : (
                              row[col?.key]
                            )}
                          </div>
                        </td>
                      ))}
                      {actions && (
                        <td className="px-4 py-2 items-center mt-2 flex space-x-4">
                          {actions.map((action, actionIndex) => (
                            <Tooltip
                              key={actionIndex}
                              label={action.tooltip || "Action"}
                            >
                              <button
                                className="hover:text-custom-dark items-center flex justify-center"
                                onClick={() => action.onClick(row)}
                              >
                                {action.icon}
                              </button>
                            </Tooltip>
                          ))}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};
export default GenericTable;
