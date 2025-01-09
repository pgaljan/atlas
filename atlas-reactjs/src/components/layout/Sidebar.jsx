import { Sidebar } from "flowbite-react";
import { useState } from "react";
import { BsDatabaseFillCheck, BsFillTrashFill } from "react-icons/bs";
import { FaPlusCircle, FaRocket } from "react-icons/fa";
import { FaImages, FaUsersGear } from "react-icons/fa6";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { Link, useLocation } from "react-router-dom";
import StructureModal from "../modals/StructureModal";

// Define custom theme for the Sidebar
const ownTheme = {
  root: {
    base: "h-full",
    collapsed: {
      on: "w-16",
      off: "w-64",
    },
    inner:
      "h-full overflow-hidden max-h-screen h-auto overflow-x-hidden rounded bg-gray-50 py-4 px-3 dark:bg-gray-800",
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
};

export function SidebarPage({ onSubmit }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  const handleModalToggle = () => {
    setIsModalOpen((prev) => !prev);
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: TbLayoutDashboardFilled,
      link: "/home",
    },
    { name: "Media", icon: FaImages, link: "/media" },
    {
      name: "Team Members",
      icon: FaUsersGear,
      link: "/team-members",
    },
    {
      name: "My Backups",
      icon: BsDatabaseFillCheck,
      link: "/backups",
    },
    { name: "Trash", icon: BsFillTrashFill, link: "/trash" },
  ];

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
              {menuItems.map((item) => (
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
                          : `${ownTheme.item.icon.base}`
                      } ${className}`}
                    />
                  )}
                  as={Link}
                  to={item.link}
                >
                  {item.name}
                </Sidebar.Item>
              ))}

              {/* <Sidebar.Collapse icon={HiShoppingBag} label="E-commerce">
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
              </Sidebar.Collapse> */}
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
  );
}
