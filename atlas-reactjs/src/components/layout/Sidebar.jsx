import { Sidebar } from "flowbite-react";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { BiSolidMessageRoundedDots } from "react-icons/bi";
import { BsDatabaseFillCheck } from "react-icons/bs";
import { CgTemplate } from "react-icons/cg";
import { SiGithubactions } from "react-icons/si";
import { FaPlusCircle, FaRocket, FaSlideshare } from "react-icons/fa";
import { FiExternalLink, FiSettings } from "react-icons/fi";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useFeatureFlag from "../../hooks/useFeatureFlag";
import { fetchAppSettings } from "../../redux/slices/app-settings";
import { fetchCatalogsByUserTier } from "../../redux/slices/structure-catalog";
import { fetchSubscription } from "../../redux/slices/subscriptions";
import Carousel from "../carousels";
import { TbTemplate } from "react-icons/tb";
import StructureModal from "../modals/StructureModal";
import { MdDatasetLinked } from "react-icons/md";

// Define custom theme for the Sidebar
const ownTheme = {
  root: {
    base: "h-full",
    collapsed: {
      on: "w-16",
      off: "w-64",
    },
    inner:
      "h-full overflow-hidden max-h-screen h-auto overflow-x-hidden rounded bg-gray-50 py-4 px-3 dark:bg-gray-800",
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

export function SidebarPage({ onSubmit }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [feedbackLink, setFeedbackLink] = useState("");
  const userId = Cookies.get("atlas_userId");
  const [showBanner, setShowBanner] = useState(false);
  const [catalogs, setCatalogs] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (userId) {
      dispatch(fetchSubscription(userId)).then((res) => {
        setCurrentPlan(res.payload?.plan?.name);
      });
    }
  }, [dispatch, userId]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const resultAction = await dispatch(fetchAppSettings());
        if (fetchAppSettings.fulfilled.match(resultAction)) {
          const settings = resultAction.payload;
          if (settings?.feedbackLink) {
            setFeedbackLink(settings.feedbackLink);
            localStorage.setItem("appName", settings.appName);
            localStorage.setItem("primaryColor", settings.primaryColor);
          }
        } else {
          cogoToast.error("Failed to fetch app settings.");
        }
      } catch (error) {
        cogoToast.error("Error loading app settings.");
      }
    };

    loadSettings();
  }, [dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentPlan) return;
      const resultAction = await dispatch(fetchCatalogsByUserTier(currentPlan));
      if (fetchCatalogsByUserTier.fulfilled.match(resultAction)) {
        setCatalogs(resultAction.payload);
      }
    };
    fetchData();
  }, [dispatch, currentPlan]);
  const handleModalToggle = () => {
    setIsModalOpen((prev) => !prev);
  };

  const handleCatalogClose = () => {
    setShowBanner(false);
    handleModalToggle();
  };
  // Check if the user can create a new structure
  const canCreateStructure = useFeatureFlag("Structures");
  // Reusable function to handle feature restrictions
  const handleFeatureClick = (canAccess, action) => {
    if (canAccess) {
      action();
    } else {
      navigate("?plan=upgrade-to-premium");
    }
  };
  const menuItems = [
    {
      name: "Dashboard",
      icon: TbLayoutDashboardFilled,
      link: "/app/dashboard",
    },
    {
      name: "Templates",
      icon: TbTemplate,
      link: "/app/templates", 
    },

    // { name: "Uploaded Files", icon: FaImages, link: "/app/uploaded-files" },
    {
      name: "Invitations",
      icon: FaSlideshare,
      link: "/app/invitations",
    },
    {
      name: "My Backups",
      icon: BsDatabaseFillCheck,
      link: "/app/backups",
    },

    // {
    //   name: "Deleted Markmaps",
    //   icon: BsFillTrashFill,
    //   link: "/app/deleted-markmaps",
    // },

    {
      name: "Settings",
      icon: FiSettings,
      link: "/app/user-settings",
    },
  ];
  const handleNewStructureClick = () => {
    if (!canCreateStructure) {
      return handleFeatureClick(false);
    }
    return catalogs.length > 0 ? setShowBanner(true) : handleModalToggle();
  };

  const handleUseTemplate = () => {
    setShowBanner(false);
    setIsModalOpen(false);
  };
  return (
    <>
      <Sidebar
        theme={ownTheme}
        aria-label="Sidebar with multi-level dropdown example"
      >
        <div className="relative h-full">
          <Sidebar.Items>
            <div className="flex justify-center mb-4 mt-3">
              <button
                onClick={handleNewStructureClick}
                className="bg-custom-main text-white py-2 px-6 font-semibold flex items-center space-x-3 rounded-md"
              >
                <FaPlusCircle />
                <span>New Structure</span>
              </button>
            </div>
            <Sidebar.ItemGroup>
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
                          : `${ownTheme.item.icon.base}`
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

          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 mb-4">
            {feedbackLink && (
              <div className="pt-4">
                <a
                  href={feedbackLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-2 border-custom-main text-custom-main py-2 flex items-center justify-center rounded-md hover:bg-custom-main hover:text-white transition-colors"
                >
                  <MdDatasetLinked className="mr-2" />
                  Feedback
                </a>
              </div>
            )}

            <div className="pt-4">
              <Link
                to="/app/upgrade-plans"
                className="border-2 border-custom-main text-custom-main py-2 px-10 flex items-center space-x-4 rounded-md hover:bg-custom-main hover:text-white"
              >
                <FaRocket />
                <span>Upgrade</span>
              </Link>
            </div>
          </div>
        </div>
      </Sidebar>
      <StructureModal
        isOpen={isModalOpen}
        onClose={handleModalToggle}
        onSubmit={onSubmit}
      />
      {userId && showBanner && (
        <Carousel
          data={catalogs}
          onClose={handleCatalogClose}
          onUseTemplate={handleUseTemplate}
        />
      )}
    </>
  );
}
