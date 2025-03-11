import { Sidebar } from "flowbite-react";
import { useState } from "react";
import { BsDatabaseFillCheck, BsFillTrashFill } from "react-icons/bs";
import { FaPlusCircle, FaRocket } from "react-icons/fa";
import { FaImages, FaUsersGear } from "react-icons/fa6";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useFeatureFlag from "../../hooks/useFeatureFlag";
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
  const navigate = useNavigate();
  const location = useLocation();

  const handleModalToggle = () => {
    setIsModalOpen((prev) => !prev);
  };

  // Check if the user can create a new structure
  const canCreateStructure = useFeatureFlag("Structures");

  // Reusable function to handle feature restrictions
  const handleFeatureClick = (canAccess, action) => {
    if (canAccess) {
      action();
    } else {
      navigate("?plan=upgrade-to-premium");
    }
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: TbLayoutDashboardFilled,
      link: "/app/dashboard",
    },
    // { name: "Uploaded Files", icon: FaImages, link: "/app/uploaded-files" },
    // {
    //   name: "Team Members",
    //   icon: FaUsersGear,
    //   link: "/app/team-members",
    // },
    {
      name: "My Backups",
      icon: BsDatabaseFillCheck,
      link: "/app/backups",
    },
    // {
    //   name: "Deleted Markmaps",
    //   icon: BsFillTrashFill,
    //   link: "/app/deleted-markmaps",
    // },
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
                onClick={() =>
                  handleFeatureClick(canCreateStructure, handleModalToggle)
                }
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
            </Sidebar.ItemGroup>
          </Sidebar.Items>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 mb-4">
            <Link
              to="/app/upgrade-plans"
              className="border-2 border-custom-main text-custom-main py-2 px-10 flex items-center space-x-4 rounded-md hover:bg-custom-main hover:text-white"
            >
              <FaRocket />
              <span>Upgrade</span>
            </Link>
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
