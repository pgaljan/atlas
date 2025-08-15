import { FiSettings, FiUser, FiMessageCircle, FiEye } from "react-icons/fi"

export const PERMISSION_LEVELS = {
  OWNER: "owner",
  EDITOR: "editor",
  COMMENTER: "commenter",
  VIEWER: "viewer",
}

export const PERMISSION_CONFIG = {
  [PERMISSION_LEVELS.OWNER]: {
    label: "Owner",
    description: "Full control - can add collaborators, edit, and export",
    icon: FiSettings,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  [PERMISSION_LEVELS.EDITOR]: {
    label: "Can edit",
    description: "Can edit structure map and records",
    icon: FiUser,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  [PERMISSION_LEVELS.COMMENTER]: {
    label: "Can comment",
    description: "Can browse and comment on structure map and records",
    icon: FiMessageCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  [PERMISSION_LEVELS.VIEWER]: {
    label: "Can view",
    description: "Can browse and export structure map and records",
    icon: FiEye,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
}
