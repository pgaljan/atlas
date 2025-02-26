import cogoToast from "@successtar/cogo-toast";
import { Avatar, Dropdown, Navbar } from "flowbite-react";
import Cookies from "js-cookie";
import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";
import {
  HiInformationCircle,
  HiMail,
  HiNewspaper,
  HiSupport,
} from "react-icons/hi";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../../redux/slices/auth";

const Header = () => {
  const [activeTab, setActiveTab] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    window.location.href = `/${tab.toLowerCase()}`;
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      Cookies.remove("atlas_access_token");
      Cookies.remove("atlas_userId");
      Cookies.remove("atlas_username");
      Cookies.remove("atlas_email");

      cogoToast.success("Logged out successfully!");
      navigate("/");
    } catch (error) {
      cogoToast.error(
        error?.message ||
          "An unexpected error occurred during logout. Please try again."
      );
    }
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
              className="border-2 border-gray-300 rounded-md px-4 py-2 w-full focus:border-custom-main  focus:outline-none pl-10"
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
              <span className="block truncate text-sm font-medium">
                {Cookies.get("atlas_username")}
              </span>
            </Dropdown.Header>
            <Link to="/app/me">
              <Dropdown.Item>Profile</Dropdown.Item>
            </Link>
            <Dropdown.Item>Notification preferences</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleLogout}>Sign out</Dropdown.Item>
          </Dropdown>
        </div>
      </Navbar>
    </header>
  );
};

export default Header;
