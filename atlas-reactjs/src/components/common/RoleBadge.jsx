import { FiEye, FiEdit3, FiMessageSquare, FiAward } from "react-icons/fi"

const RoleBadge = ({ role }) => {
  const roleConfig = {
    owner: {
      label: "Owner",
      icon: <FiAward className="w-4 h-4 mr-1" />,
      classes: "bg-gradient-to-r from-purple-200 to-purple-300 text-purple-900",
    },
    editor: {
      label: "Editor",
      icon: <FiEdit3 className="w-4 h-4 mr-1" />,
      classes: "bg-gradient-to-r from-green-200 to-green-300 text-green-900",
    },
    commenter: {
      label: "Commenter",
      icon: <FiMessageSquare className="w-4 h-4 mr-1" />,
      classes: "bg-gradient-to-r from-yellow-200 to-yellow-300 text-yellow-900",
    },
    viewer: {
      label: "Viewer",
      icon: <FiEye className="w-4 h-4 mr-1" />,
      classes: "bg-gradient-to-r from-blue-200 to-blue-300 text-blue-900",
    },
  }

  const config = roleConfig[role] || {
    label: role,
    icon: null,
    classes: "bg-gray-200 text-gray-800",
  }

  return (
    <span
      className={`ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${config.classes}`}
    >
      {config.icon}
      {config.label}
    </span>
  )
}

export default RoleBadge
