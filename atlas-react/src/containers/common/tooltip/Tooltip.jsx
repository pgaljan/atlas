import React from "react"

const Tooltip = ({ children, label, position = "top", className = "" }) => {
  const positionClasses = {
    top: "bottom-12",
    bottom: "top-12",
    left: "right-12",
    right: "left-12",
  }

  return (
    <div className="group relative">
      {children}
      <span
        className={`absolute left-1/2 transform -translate-x-1/2 px-2 py-1 bg-custom-main text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity ${positionClasses[position]} ${className}`}
      >
        {label}
      </span>
    </div>
  )
}

export default Tooltip
