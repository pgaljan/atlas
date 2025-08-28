import React from "react";

const HeaderTab = ({ tabs, activeTab, onTabClick }) => {
  return (
    <ul className="flex space-x-6 border-b mb-8 text-custom-text-grey">
      {tabs?.map((tab, index) => (
        <li
          key={index}
          className={`pb-2 cursor-pointer ${
            activeTab === tab?.label
              ? "border-b-2 border-custom-main text-custom-main"
              : ""
          }`}
          onClick={() => onTabClick(tab?.label)}
        >
          {tab?.label}
        </li>
      ))}
    </ul>
  );
};

export default HeaderTab;
