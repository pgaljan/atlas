import { Navbar } from "flowbite-react";
import UserDropdown from "../../menu/CustomAdminMenu";

const AdminHeader = () => {
  return (
    <header className="bg-gray-100  flex justify-between items-center">
      <Navbar fluid rounded className="w-full p-4">
        <Navbar.Brand href="#">
          <h1 className="text-2xl ml-6 font-bold text-custom-main capitalize">
            Admin Portal
          </h1>
        </Navbar.Brand>
        <div className="flex items-center gap-x-4">
          <UserDropdown />
        </div>
      </Navbar>
    </header>
  );
};

export default AdminHeader;
