import { useState } from "react"
import { Sidebar } from "flowbite-react"
import {
  HiChartPie,
  HiInbox,
  HiShoppingBag,
  HiUser,
  HiDownload,
} from "react-icons/hi"
import { FaRocket, FaPlusCircle } from "react-icons/fa"
import StructureModal from "../structure-modal/StructureModal"

// Define custom theme for the Sidebar
const ownTheme = {
  root: {
    base: "h-full",
    collapsed: {
      on: "w-16",
      off: "w-64",
    },
    inner:
      "h-full overflow-y-auto overflow-x-hidden rounded bg-gray-50 py-4 px-3 dark:bg-gray-800",
  },
  item: {
    base: "flex items-center justify-center rounded-lg p-2 text-base font-normal text-[#660000] transition duration-75",
    active: "bg-[#660000] text-white ", // Active state
    // hover: "hover:bg-gray-100 hover:text-white dark:hover:bg-gray-700", // Hover state
    icon: {
      base: "h-6 w-6 flex-shrink-0 text-[#660000] transition duration-75",
      active: "text-white", // Active icon color
    },
  },
}

export function SidebarPage({ onSubmit }) {
  const [activeItem, setActiveItem] = useState("Dashboard")
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleItemClick = itemName => {
    setActiveItem(itemName)
  }

  const handleModalToggle = () => {
    setIsModalOpen(prev => !prev)
  }

  return (
    <>
      <Sidebar
        theme={ownTheme}
        aria-label="Sidebar with multi-level dropdown example"
      >
        <div className="relative h-full">
          <Sidebar.Items>
            <div className="flex justify-center mb-4 mt-3">
              <button
                onClick={handleModalToggle}
                className="bg-custom-main text-white py-2 px-6 font-semibold flex items-center space-x-3 rounded-md"
              >
                <FaPlusCircle />
                <span>New Structure</span>
              </button>
            </div>

            <Sidebar.ItemGroup>
              {[
                { name: "Dashboard", icon: HiChartPie },
                { name: "Inbox", icon: HiInbox },
                { name: "Users", icon: HiUser },
                { name: "Export", icon: HiDownload },
              ].map(item => (
                <Sidebar.Item
                  key={item.name}
                  href="#"
                  icon={({ className }) =>
                    item.name === activeItem ? (
                      <item.icon
                        className={`${className} ${ownTheme.item.icon.active}`}
                      />
                    ) : (
                      <item.icon
                        className={`${className} ${ownTheme.item.icon.base}`}
                      />
                    )
                  }
                  onClick={() => handleItemClick(item?.name)}
                  className={`${
                    activeItem === item?.name
                      ? `${ownTheme.item?.active}`
                      : `${ownTheme.item?.base} ${ownTheme.item.hover}`
                  }`}
                >
                  {item.name}
                </Sidebar.Item>
              ))}

              <Sidebar.Collapse icon={HiShoppingBag} label="E-commerce">
                {["Products", "Sales", "Refunds", "Shipping"].map(subItem => (
                  <Sidebar.Item
                    key={subItem}
                    href="#"
                    onClick={() => handleItemClick(subItem)}
                    className={`${
                      activeItem === subItem && `${ownTheme.item.active}`
                    }`}
                  >
                    {subItem}
                  </Sidebar.Item>
                ))}
              </Sidebar.Collapse>
            </Sidebar.ItemGroup>
          </Sidebar.Items>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 mb-4">
            <button className="border-2 border-custom-main text-custom-main py-2 px-10 flex items-center space-x-4 rounded-md hover:bg-custom-main hover:text-white">
              <FaRocket />
              <span>Upgrade</span>
            </button>
          </div>
        </div>
      </Sidebar>
      <StructureModal
        isOpen={isModalOpen}
        onClose={handleModalToggle}
        onSubmit={onSubmit}
      />
    </>
  )
}
