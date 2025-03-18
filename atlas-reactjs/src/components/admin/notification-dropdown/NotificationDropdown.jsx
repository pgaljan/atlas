import { useState } from "react";
import Dropdown from "../../ui/Dropdown";
import DropdownItem from "../../ui/DropdownItem";
import { Link } from "react-router-dom";
import Icons from "../../../constants/icons";

const notifications = [
  {
    id: 1,
    name: "Terry Franci",
    message: "requests permission to change",
    project: "Project - Nganter App",
    time: "5 min ago",
    imgSrc: "/assets/userimg.jpeg",
    statusColor: "bg-success-500",
  },
  {
    id: 2,
    name: "Alena Franci",
    message: "requests permission to change",
    project: "Project - Nganter App",
    time: "8 min ago",
    imgSrc: "/assets/userimg.jpeg",
    statusColor: "bg-success-500",
  },
  {
    id: 3,
    name: "Jocelyn Kenter",
    message: "requests permission to change",
    project: "Project - Nganter App",
    time: "15 min ago",
    imgSrc: "/assets/userimg.jpeg",
    statusColor: "bg-success-500",
  },
  {
    id: 4,
    name: "Brandon Philips",
    message: "requests permission to change",
    project: "Project - Nganter App",
    time: "1 hr ago",
    imgSrc: "/assets/userimg.jpeg",
    statusColor: "bg-error-500",
  },
  {
    id: 5,
    name: "Jocelyn Kenter",
    message: "requests permission to change",
    project: "Project - Nganter App",
    time: "15 min ago",
    imgSrc: "/assets/userimg.jpeg",
    statusColor: "bg-success-500",
  },
  {
    id: 6,
    name: "Brandon Philips",
    message: "requests permission to change",
    project: "Project - Nganter App",
    time: "1 hr ago",
    imgSrc: "/assets/userimg.jpeg",
    statusColor: "bg-error-500",
  },
  {
    id: 7,
    name: "Jocelyn Kenter",
    message: "requests permission to change",
    project: "Project - Nganter App",
    time: "15 min ago",
    imgSrc: "/assets/userimg.jpeg",
    statusColor: "bg-success-500",
  },
  {
    id: 8,
    name: "Brandon Philips",
    message: "requests permission to change",
    project: "Project - Nganter App",
    time: "1 hr ago",
    imgSrc: "/assets/userimg.jpeg",
    statusColor: "bg-error-500",
  },
];

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    setNotifying(false);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };
  const handleClick = () => {
    toggleDropdown();
    setNotifying(false);
  };

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-8 w-8 hover:bg-gray-100 "
        onClick={handleClick}
      >
        <span
          className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 ${
            !notifying ? "hidden" : "flex"
          }`}
        >
          <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
        </span>
        <Icons.NotificationIcon />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[500px] w-[400px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg  sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100  ">
          <h5 className="text-lg font-semibold text-gray-800 ">Notification</h5>
          <button
            onClick={toggleDropdown}
            className="text-gray-500 transition  hover:text-gray-700 "
          >
            ✖
          </button>
        </div>
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {notifications.map((notification) => (
            <li key={notification.id}>
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 "
              >
                <span className="relative block w-full h-10 rounded-full z-1 max-w-10">
                  <img
                    width={40}
                    height={40}
                    src={notification.imgSrc}
                    alt="User"
                    className="w-full overflow-hidden rounded-full"
                  />
                  <span
                    className={`absolute bottom-0 right-0 z-10 h-2.5 w-full max-w-2.5 rounded-full border-[1.5px] border-white ${notification.statusColor} `}
                  ></span>
                </span>
                <span className="block">
                  <span className="mb-1.5 block text-theme-sm text-gray-500  space-x-1">
                    <span className="font-medium text-gray-800 ">
                      {notification.name}
                    </span>
                    <span>{notification.message}</span>
                    <span className="font-medium text-gray-800 ">
                      {notification.project}
                    </span>
                  </span>
                  <span className="flex items-center gap-2 text-gray-500 text-theme-xs ">
                    <span>Project</span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <span>{notification.time}</span>
                  </span>
                </span>
              </DropdownItem>
            </li>
          ))}
        </ul>
        <Link
          to=""
          className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
        >
          View All Notifications
        </Link>
      </Dropdown>
    </div>
  );
};

export default NotificationDropdown;
