import Cookies from "js-cookie"
import { useEffect, useRef, useState } from "react"
import Avatar from "react-avatar"
import { FiLogOut, FiSettings } from "react-icons/fi"
import { HiOutlineRocketLaunch } from "react-icons/hi2"
import { TbAppsFilled } from "react-icons/tb"
import { useNavigate } from "react-router-dom"

const CustomAdminMenu = () => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const menuRef = useRef()

  const displayName = Cookies.get("atlas_admin_username") || "Admin"
  const email = Cookies.get("atlas_admin_email") || "admin@example.com"

  useEffect(() => {
    const handleClickOutside = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])
  const handleLogout = () => {
    const cookieKeys = [
      "atlas_admin_email",
      "atlas_admin_token",
      "atlas_admin_userId",
      "atlas_admin_username",
    ]

    cookieKeys.forEach(key => Cookies.remove(key))

    localStorage.clear()
    sessionStorage.clear()

    window.location.href = "/admin-portal"
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(prev => !prev)}
        className="focus:outline-none"
      >
        <Avatar name={displayName} size="38" round />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-50 animate-fade-in">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {displayName}
            </p>
            <p className="text-xs text-gray-500 truncate">{email}</p>
          </div>

          {/* Menu Options */}
          <div className="p-1 space-y-1">
            <button
              onClick={() => {
                navigate("/app/admin-portal/user-management")
                setOpen(false)
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition"
            >
              <TbAppsFilled className="text-base" />
              Users Managment
            </button>

            <button
              onClick={() => {
                navigate("/app/admin-portal/settings")
                setOpen(false)
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition"
            >
              <FiSettings className="text-base" />
              App Settings
            </button>

            <button
              onClick={() => {
                navigate("/app/admin-portal/subscription-plan")
                setOpen(false)
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition"
            >
              <HiOutlineRocketLaunch className="text-base" />
              Subscription Plans
            </button>

            <hr className="border-gray-100" />

            <button
              onClick={() => {
                handleLogout()
                setOpen(false)
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 rounded-md font-semibold hover:bg-red-100 transition"
            >
              <FiLogOut className="text-base" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomAdminMenu
