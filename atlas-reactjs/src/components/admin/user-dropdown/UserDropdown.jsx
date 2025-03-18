import { useState } from "react";
import { Link } from "react-router";
import Icons from "../../../constants/icons";
import Dropdown from "../../ui/Dropdown";
import DropdownItem from "../../ui/DropdownItem";

const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };
  const user = {
    name: "admin",
    email: "randomuser@pimjo.com",
    image: "/assets/owner.jpg",
  };
  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dropdown-toggle"
      >
        <span className="mr-3 overflow-hidden rounded-full h-8 w-8">
          <img src={user.image} alt="User" />
        </span>

        <span className="block mr-1 font-medium text-theme-sm">
          {user.name}
        </span>
        <svg
          className={`stroke-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg"
      >
        <div>
          <span className="block font-medium text-gray-700 text-theme-sm ">
            {user.name}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 ">
            {user.email}
          </span>
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 ">
          <li>
            <Link to="/app/admin/user-profile">
              <DropdownItem
                onItemClick={closeDropdown}
                tag="a"
                className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 "
              >
                <Icons.EditProfileIcon />
                Profile
              </DropdownItem>
            </Link>
          </li>
          <li>
            <Link to="/app/user-profile">
              <DropdownItem
                onItemClick={closeDropdown}
                tag="a"
                className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 "
              >
                <Icons.AccountSettingIcon />
                Settings
              </DropdownItem>
            </Link>
          </li>
        </ul>
        <Link className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 ">
          <Icons.SignoutIcon />
          Sign out
        </Link>
      </Dropdown>
    </div>
  );
};
export default UserDropdown;
