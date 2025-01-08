import React, { useState } from "react";
import { Avatar, Dropdown, Navbar } from "flowbite-react";
import { FiSearch } from "react-icons/fi";
import {
  HiInformationCircle,
  HiSupport,
  HiMail,
  HiNewspaper,
} from "react-icons/hi";
const Header = () => {
  const [activeTab, setActiveTab] = useState("");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    // Simulate URL change or content load logic
    window.location.href = `/${tab.toLowerCase()}`;
  };

  return (
    <header className="bg-gray-100  flex justify-between items-center">
      <Navbar fluid rounded className="w-full p-4">
        {/* Logo on the Left */}
        <Navbar.Brand href="#">
          <h1 className="text-2xl font-bold text-[#660000]">ATLAS</h1>
        </Navbar.Brand>

        {/* Centered Search Bar */}
        <div className="flex items-center justify-center flex-grow">
          <div className="relative flex items-center w-full max-w-xl mx-auto">
            <FiSearch className="absolute left-4 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search for structure..."
              className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none pl-10"
            />
          </div>
        </div>

        {/* Right Side - Learning, Help, Upgrade, User Image */}
        <div className="flex items-center ml-4 space-x-6">
          {/* Learning Tab */}
          <div
            className={`cursor-pointer ${
              activeTab === "Learning"
                ? "underline underline-offset-4 text-black"
                : "text-gray-600"
            }`}
            onClick={() => handleTabClick("Learning")}
          >
            Support
          </div>

          <Dropdown
            arrowIcon={false}
            inline
            label={
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center cursor-pointer">
                ?
              </div>
            }
          >
            <Dropdown.Item icon={HiInformationCircle}>
              <span className="ml-2">Intro to Atlas</span>
            </Dropdown.Item>
            <Dropdown.Item icon={HiSupport}>
              <span className="ml-2">Help Center</span>
            </Dropdown.Item>
            <Dropdown.Item icon={HiMail}>
              <span className="ml-2">Email Support</span>
            </Dropdown.Item>
            <Dropdown.Item icon={HiNewspaper}>
              <span className="ml-2">Atlas News and Updates</span>
            </Dropdown.Item>
          </Dropdown>

          {/* User Icon */}
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar
                alt="User settings"
                img="/assets/userimg.jpeg"
                rounded
                className="w-[40px] h-[28px]"
              />
            }
          >
            <Dropdown.Header>
              <span className="block text-sm">Bonnie Green</span>
              <span className="block truncate text-sm font-medium">
                name@flowbite.com
              </span>
            </Dropdown.Header>
            <Dropdown.Item>Profile</Dropdown.Item>
            <Dropdown.Item>Settings</Dropdown.Item>
            <Dropdown.Item>Notification preference</Dropdown.Item>
            <Dropdown.Item>More account options</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item>Sign out</Dropdown.Item>
          </Dropdown>
        </div>
      </Navbar>
    </header>
  );
};

export default Header;
