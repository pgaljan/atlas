import React, { useState } from "react";

const Tooltip = ({ children, label, position = "top",customPosition = "", className = "" }) => {
  const [isHovered, setIsHovered] = useState(false);

  const positionClasses = {
    top: "bottom-12",
    bottom: "top-12",
    left: "right-12",
    right: "left-12",
  };

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {isHovered && (
        <span
          className={`absolute text-nowrap left-1/2 transform -translate-x-1/2 px-2 py-1 bg-custom-main text-white text-xs rounded transition-opacity  ${customPosition || positionClasses[position]} ${className}`}
        >
          {label}
        </span>
      )}
    </div>
  );
};

export default Tooltip;
