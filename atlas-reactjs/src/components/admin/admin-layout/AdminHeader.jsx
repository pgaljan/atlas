import { Navbar } from "flowbite-react";
import React from "react";
import NotificationDropdown from "../notification-dropdown/NotificationDropdown";
import UserDropdown from "../user-dropdown/UserDropdown";

const AdminHeader = () => {
  return (
    <header className="bg-gray-100  flex justify-between items-center">
      <Navbar fluid rounded className="w-full p-4">
        <Navbar.Brand href="#">
          <h1 className="text-2xl font-bold text-[#660000] capitalize">
            admin
          </h1>
        </Navbar.Brand>
        <div className="flex items-center gap-x-4">
          <NotificationDropdown />
          <UserDropdown />
        </div>
      </Navbar>
    </header>
  );
};

export default AdminHeader;
