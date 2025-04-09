import cogoToast from "@successtar/cogo-toast";
import { Avatar, Dropdown, Navbar } from "flowbite-react";
import Cookies from "js-cookie";
import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { HiUserAdd } from "react-icons/hi";
import { useDispatch } from "react-redux";
import { BiMailSend } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../redux/slices/auth";
import InviteModal from "../modals/InviteModal";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      Cookies.remove("atlas_access_token");
      Cookies.remove("atlas_userId");
      Cookies.remove("atlas_username");
      Cookies.remove("atlas_email");
      Cookies.remove("workspaceId");

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
    <header className="bg-gray-100 flex justify-between items-center">
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
              className="border-2 border-gray-300 rounded-md px-4 py-2 w-full focus:border-custom-main focus:outline-none pl-10"
            />
          </div>
        </div>

        {/* Right Side - Learning, Help, Upgrade, User Image */}
        <div className="flex items-center ml-4 space-x-6">
          {/* Invite Button */}
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-custom-main rounded-lg border-2 border-custom-main hover:text-white hover:bg-custom-main transition"
          >
            <BiMailSend size={20} />
            <span className="text-base">Invite Members</span>
          </button>

          {/* User Icon */}
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar
                alt="User settings"
                img="/assets/userimg.jpeg"
                rounded
                className="w-[40px]"
              />
            }
          >
            <div className="w-auto min-w-[150px]">
              <Dropdown.Header>
                <span className="block truncate text-sm font-medium">
                  {Cookies.get("atlas_username")}
                </span>
              </Dropdown.Header>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout}>Sign out</Dropdown.Item>
            </div>
          </Dropdown>
        </div>
      </Navbar>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <InviteModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
