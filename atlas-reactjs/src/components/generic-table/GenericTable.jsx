import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";

const GenericTable = ({
  title,
  tabs = null,
  enableSearch = false,
  columns,
  data,
  actions = null,
  buttons,
}) => {
  const [activeTab, setActiveTab] = useState(tabs ? tabs[0]?.key : null);

  return (
    <div className="p-8 rounded-[18px] bg-custom-background-white h-auto max-h-[90%] shadow-md">
      <h1 className="text-3xl font-semibold text-custom-text-heading mb-4">
        {title}
      </h1>
      {tabs && (
        <div className="flex items-center mb-4">
          {tabs?.map((tab) => (
            <button
              key={tab?.key}
              className={`px-4 py-2 font-semibold transition-colors ${
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
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom-main focus:outline-none"
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
              <th className="px-4 py-2">#ID</th>
              {columns?.map((col) => (
                <th key={col?.key} className="px-4 py-2">
                  <div className="flex  items-center">
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
            {data?.map((row, rowIndex) => (
              <tr
                key={row?.id || rowIndex}
                className="border-b border-gray-300"
              >
                <td className="px-4 py-2">{row?.id}</td>
                {columns?.map((col, colIndex) => (
                  <td key={col?.key} className="px-4 py-2">
                    <div className="flex items-center">
                      {col?.key === "name" && (
                        <>
                          {row?.Avatar && (
                            <img
                              src={row?.Avatar}
                              alt={row[col?.key]}
                              className="w-8 h-8 rounded-full mr-2"
                            />
                          )}
                          {row[col?.key]}
                        </>
                      )}
                      {col?.key !== "name" && row[col?.key]}
                    </div>
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-2 items-center flex  space-x-4">
                    {actions?.map((action, actionIndex) => (
                      <button
                        key={actionIndex}
                        className=" hover:text-custom-dark"
                      >
                        {action?.icon}
                      </button>
                    ))}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GenericTable;
