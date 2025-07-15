import cogoToast from "@successtar/cogo-toast";
import { Dropdown, Navbar } from "flowbite-react";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import Avatar from "react-avatar";
import { FiLogOut, FiSearch } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAppSettings } from "../../redux/slices/app-settings";
import { logoutUser } from "../../redux/slices/auth";
import InviteModal from "../modals/InviteModal";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoUrl, setLogoUrl] = useState("/assets/atlas-logo.png");
  const [appName, setAppName] = useState("loading ...");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      Cookies.remove("atlas_access_token");
      Cookies.remove("atlas_userId");
      Cookies.remove("atlas_username");
      Cookies.remove("atlas_email");
      Cookies.remove("workspaceId");
      localStorage.clear();
      cogoToast.success("Logged out successfully!");
      navigate("/");
    } catch (error) {
      cogoToast.error(
        error?.message ||
          "An unexpected error occurred during logout. Please try again."
      );
    }
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const resultAction = await dispatch(fetchAppSettings());
        if (fetchAppSettings.fulfilled.match(resultAction)) {
          const settings = resultAction.payload;
          if (settings) {
            setLogoUrl(settings.logoUrl || "/assets/atlas-logo.png");
            setAppName(settings.appName || "ATLAS");
          }
        }
      } catch (error) {
        console.error("Error loading app settings");
      }
    };

    loadSettings();
  }, [dispatch]);

  return (
    <header className="bg-gray-100 flex justify-between items-center">
      <Navbar fluid rounded className="w-full p-4">
        {/* Logo */}
        <Navbar.Brand href="#" className="flex items-center gap-2">
          <img src={logoUrl} className="h-8 w-8" alt={appName} />
          <span className="text-2xl font-bold text-custom-main uppercase">
            {appName}
          </span>
        </Navbar.Brand>

        {/* Search */}
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

        {/* User Menu */}
        <div className="flex items-center ml-4 space-x-6">
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar
                name={Cookies.get("atlas_username") || "User"}
                size="36"
                round={true}
                className="text-lg"
              />
            }
          >
            <Dropdown.Header>
              <span className="block text-sm font-semibold text-gray-900 truncate">
                {Cookies.get("atlas_username")}
              </span>
              <span className="block text-xs text-gray-500 truncate">
                {Cookies.get("atlas_email")}
              </span>
            </Dropdown.Header>

            <Dropdown.Item
              onClick={() => navigate("/app/user-settings")}
              className="hover:bg-gray-100 transition-colors"
            >
              Account Settings
            </Dropdown.Item>

            <Dropdown.Item
              onClick={() => navigate("/api-management/overview")}
              className="hover:bg-gray-100 transition-colors"
            >
              API Access
            </Dropdown.Item>

            <Dropdown.Divider />

            <Dropdown.Item
              icon={FiLogOut}
              onClick={handleLogout}
              className="!text-red-600 hover:!bg-red-100 font-semibold transition-all"
            >
              Sign Out
            </Dropdown.Item>
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
