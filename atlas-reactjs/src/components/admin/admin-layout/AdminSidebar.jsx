import { Sidebar } from "flowbite-react"
import React from "react"
import { Link, useLocation } from "react-router-dom"
import { IoMdArrowRoundBack } from "react-icons/io"
import { BiCarousel } from "react-icons/bi"
import { MdOutlinePrivacyTip } from "react-icons/md"
import { FiUsers } from "react-icons/fi"
import { MdWorkspacePremium } from "react-icons/md"
import { HiMiniClipboardDocumentCheck } from "react-icons/hi2"

const ownTheme = {
  root: {
    base: "h-full",
    collapsed: {
      on: "w-16",
      off: "w-64",
    },
    inner:
      "h-full overflow-hidden max-h-screen h-auto overflow-x-hidden rounded bg-gray-50 pt-2 pb-4 px-3 border-t-0",
  },
  item: {
    base: "flex items-center justify-center rounded-lg p-2 text-base font-normal text-[#660000] transition duration-75",
    active: "bg-[#660000] text-white",
    hover: "hover:bg-[#660000] hover:text-white group",
    icon: {
      base: "h-6 w-6 flex-shrink-0 text-[#660000] transition duration-75 group-hover:text-white",
      active: "text-white",
    },
  },
}

const AdminSidebar = () => {
  const location = useLocation()

  const menuItems = [
    {
      name: "Users Management",
      icon: FiUsers,
      link: "/app/admin-portal/user-management",
    },
    {
      name: "Structure Catalogs",
      icon: BiCarousel,
      link: "/app/admin-portal/structure-catalogs",
    },
    {
      name: "Subscription Plan",
      icon: MdWorkspacePremium,
      link: "/app/admin-portal/subscription-plan",
    },
    {
      name: "Privacy Policy",
      icon: MdOutlinePrivacyTip,
      link: "/app/admin-portal/policy",
    },
    {
      name: "Terms of Service",
      icon: HiMiniClipboardDocumentCheck,
      link: "/app/admin-portal/terms-of-service",
    },
  ]

  return (
    <Sidebar
      theme={ownTheme}
      aria-label="Sidebar with multi-level dropdown example"
    >
      <div className="relative h-full flex flex-col justify-between">
        <Sidebar.Items>
          <Sidebar.ItemGroup className="mt-0 border-none">
            {menuItems.map(item => (
              <Sidebar.Item
                key={item.name}
                className={`${
                  location.pathname === item.link
                    ? `${ownTheme.item.active}`
                    : `${ownTheme.item.base} ${ownTheme.item.hover}`
                }`}
                icon={({ className }) => (
                  <item.icon
                    className={`${
                      location.pathname === item.link
                        ? ownTheme.item.icon.active
                        : ownTheme.item.icon.base
                    } ${className}`}
                  />
                )}
                as={Link}
                to={item.link}
              >
                {item.name}
              </Sidebar.Item>
            ))}
          </Sidebar.ItemGroup>
        </Sidebar.Items>

        <div className="absolute bottom-4 w-full flex justify-center px-8">
          <Link
            to="/"
            className="border-2 border-custom-main text-custom-main py-2 px-10 flex items-center gap-2 rounded-md hover:bg-custom-main hover:text-white transition whitespace-nowrap min-w-max"
          >
            <IoMdArrowRoundBack />
            <span>Return to Atlas</span>
          </Link>
        </div>
      </div>
    </Sidebar>
  )
}

export default AdminSidebar
