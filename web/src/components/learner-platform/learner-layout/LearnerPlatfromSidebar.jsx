import React from 'react';
import { Sidebar } from 'flowbite-react';
import { Link, useLocation } from 'react-router-dom';
import { FaUserCircle, FaThLarge, FaCalendarAlt, FaEnvelope, FaCog } from 'react-icons/fa';

const ownTheme = {
  root: {
    base: 'h-full',
    collapsed: { on: 'w-16', off: 'w-64' },
    inner: 'h-full overflow-hidden max-h-screen bg-white py-4 px-3',
  },
  itemGroup: {
    base: 'space-y-3',
  },
  item: {
    base: 'flex items-center gap-3 rounded-lg p-2 text-sm font-medium text-custom-main transition duration-150',
    active: 'bg-custom-main text-white',
    hover: 'hover:bg-custom-secondary hover:text-white group',
    icon: {
      base: 'h-5 w-5 flex-shrink-0 text-custom-main transition duration-150 group-hover:text-white',
      active: 'text-white',
    },
  },
};

export default function LearnerPlatformSidebar() {
  const location = useLocation();

  const menuItems = [
    { name: 'My Path', icon: FaUserCircle, link: '/learner/dashboard' },
    { name: 'My Canvas', icon: FaThLarge, link: '/learner/my-canvas' },
    { name: 'My Quarters', icon: FaCalendarAlt, link: '/learner/my-quarters' },
    { name: 'Messages', icon: FaEnvelope, link: '/learner/messages' },
    { name: 'My Account', icon: FaCog, link: '/learner/account-settings' },
  ];

  return (
    <div className="h-full flex flex-col">
      <Link
        to="/learner/dashboard"
        className="px-4 pb-4 pt-3 bg-custom-main text-white hover:bg-custom-secondary transition"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-white flex items-center justify-center text-custom-main font-semibold">
            LD
          </div>
          <div>
            <div className="text-sm font-semibold">Learner Dashboard</div>
          </div>
        </div>
      </Link>

      <div className="flex-1 overflow-auto">
        <Sidebar theme={ownTheme} aria-label="Learner platform sidebar" className="h-full">
          <Sidebar.Items>
            <Sidebar.ItemGroup>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.link;
                return (
                  <Sidebar.Item
                    key={item.name}
                    as={Link}
                    to={item.link}
                    className={`${
                      isActive
                        ? ownTheme.item.active
                        : ownTheme.item.base + ' ' + ownTheme.item.hover
                    }`}
                    icon={({ className }) => (
                      <item.icon
                        className={`${
                          isActive ? ownTheme.item.icon.active : ownTheme.item.icon.base
                        } ${className}`}
                      />
                    )}
                  >
                    {item.name}
                  </Sidebar.Item>
                );
              })}
            </Sidebar.ItemGroup>
          </Sidebar.Items>
        </Sidebar>
      </div>
    </div>
  );
}
