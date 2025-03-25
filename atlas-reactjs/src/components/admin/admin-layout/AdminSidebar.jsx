import { Sidebar } from "flowbite-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaUsersGear } from "react-icons/fa6";
import { MdWorkspacePremium } from "react-icons/md";

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
};

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      name: "Users",
      icon: FaUsersGear,
      link: "/app/admin-portal/user-management",
    },
    {
      name: "Subscription Plan",
      icon: MdWorkspacePremium,
      link: "/app/admin-portal/subscription-plan",
    },
  ];

  return (
    <Sidebar
      theme={ownTheme}
      aria-label="Sidebar with multi-level dropdown example"
    >
      <div className="relative h-full flex flex-col justify-between">
        <Sidebar.Items>
          <Sidebar.ItemGroup className="mt-0 border-none">
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
            <span>Return to site</span>
          </Link>
        </div>
      </div>
    </Sidebar>
  );
};

export default AdminSidebar;
