import { Sidebar } from "flowbite-react";
import { BiCodeAlt } from "react-icons/bi";
import { HiOutlineDocumentText, HiOutlineStar } from "react-icons/hi";
import { LuActivity, LuKeyRound } from "react-icons/lu";
import { MdOutlineDashboard, MdOutlineTravelExplore } from "react-icons/md";
import { TbApi } from "react-icons/tb";
import { Link, useLocation } from "react-router-dom";

const sidebarTheme = {
  root: {
    base: "h-full",
    collapsed: {
      on: "w-16",
      off: "w-64",
    },
    inner:
      "h-full overflow-hidden max-h-screen h-auto overflow-x-hidden rounded bg-gray-50 pb-4 px-3 dark:bg-gray-800",
  },
  item: {
    base: "flex items-center justify-center rounded-lg p-2 text-base font-normal text-custom-main transition duration-75",
    active: "bg-custom-main text-white",
    hover: "hover:bg-custom-main hover:text-white group",
    icon: {
      base: "h-6 w-6 flex-shrink-0 text-custom-main transition duration-75 group-hover:text-white",
      active: "text-white",
    },
  },
};

const menuItems = [
  {
    section: "General",
    items: [
      {
        name: "Overview",
        icon: MdOutlineDashboard,
        link: "/api-management/overview",
      },
    ],
  },
  {
    section: "Favorites",
    items: [
      {
        name: "Favorites APIs",
        icon: HiOutlineStar,
        link: "/api-management/favorites/apis",
      },
      {
        name: "Activity Overview",
        icon: LuActivity,
        link: "/api-management/favorites/activity-overview",
      },
    ],
  },
  {
    section: "API Management",
    items: [
      {
        name: "APIs",
        icon: TbApi,
        link: "/api-management/apis",
      },
      {
        name: "Examples",
        icon: BiCodeAlt,
        link: "/api-management/examples",
      },
      {
        name: "Explore",
        icon: MdOutlineTravelExplore,
        link: "/api-management/explore",
      },
    ],
  },
  {
    section: "API Security",
    items: [
      {
        name: "API Keys",
        icon: LuKeyRound,
        link: "/api-management/security/keys",
      },
      {
        name: "Policies",
        icon: HiOutlineDocumentText,
        link: "/api-management/security/policies",
      },
    ],
  },
];

export default function APIManagementSidebar() {
  const location = useLocation();

  return (
    <Sidebar theme={sidebarTheme} aria-label="API Management Sidebar">
      <div className="relative h-full flex flex-col">
        <div className="flex-1 overflow-y-auto pr-1">
          <Sidebar.Items>
            {menuItems.map((group) => (
              <Sidebar.ItemGroup key={group.section}>
                <h4 className="px-2 text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  {group.section}
                </h4>
                {group.items.map((item) => (
                  <Sidebar.Item
                    key={item.name}
                    className={`${
                      location.pathname === item.link
                        ? `${sidebarTheme.item.active}`
                        : `${sidebarTheme.item.base} ${sidebarTheme.item.hover}`
                    }`}
                    icon={({ className }) => (
                      <item.icon
                        className={`${
                          location.pathname === item.link
                            ? sidebarTheme.item.icon.active
                            : `${sidebarTheme.item.icon.base}`
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
            ))}
          </Sidebar.Items>
        </div>
      </div>
    </Sidebar>
  );
}
