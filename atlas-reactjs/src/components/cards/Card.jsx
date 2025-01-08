import React from "react";
import { Dropdown } from "flowbite-react";
import {
  HiInformationCircle,
  HiSupport,
  HiMail,
  HiNewspaper,
} from "react-icons/hi";
import { Link } from "react-router-dom";

const Card = ({
  title,
  imageUrl,
  footerTitle,
  footerSubtitle,
  avatarUrl,
  linkUrl,
  customIconColor = "text-blue-500",
  customTextColor = "text-custom-main",
}) => {
  return (
    <div className="relative bg-white rounded-lg shadow-md hover:shadow-lg overflow-hidden border border-gray-200">
      <Link
        to={linkUrl}
        className="absolute cursor-pointer inset-0 z-10"
        aria-label={title}
      ></Link>

      <div className="flex flex-col">
        {/* Thumbnail */}
        <div className="w-full h-48 bg-gray-200">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover rounded-t-lg"
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col justify-between flex-grow p-3 space-y-3 border-t border-gray-300">
          {/* Title */}
          <div>
            <h3
              className={`text-lg font-semibold truncate ${customTextColor}`}
              title={title}
            >
              {title}
            </h3>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-2">
            {/* Avatar Section */}
            <Link to="#" className="flex items-center space-x-2">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover border border-gray-300"
              />
              <div>
                <p className="text-sm font-medium text-custom-main truncate">
                  {footerTitle}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {footerSubtitle}
                </p>
              </div>
            </Link>

            {/* Actions */}
            <div className="relative z-10">
              <Dropdown
                arrowIcon={false}
                inline
                label={
                  <div className="w-8 h-8 rounded-full bg-custom-main text-white flex items-center justify-center cursor-pointer">
                    {/* Three Dots */}
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <circle cx="10" cy="4" r="2" />
                      <circle cx="10" cy="10" r="2" />
                      <circle cx="10" cy="16" r="2" />
                    </svg>
                  </div>
                }
                className="absolute top-full mt-1 left-0"
              >
                <Dropdown.Item icon={HiInformationCircle}>
                  <div className="flex items-center space-x-2">
                    <span className="whitespace-nowrap">Intro to Atlas</span>
                  </div>
                </Dropdown.Item>
                <Dropdown.Item icon={HiSupport}>
                  <div className="flex items-center space-x-2">
                    <span className="whitespace-nowrap">Help Center</span>
                  </div>
                </Dropdown.Item>
                <Dropdown.Item icon={HiMail}>
                  <div className="flex items-center space-x-2">
                    <span className="whitespace-nowrap">Email Support</span>
                  </div>
                </Dropdown.Item>
                <Dropdown.Item icon={HiNewspaper}>
                  <div className="flex items-center space-x-2">
                    <span className="whitespace-nowrap">
                      Atlas News and Updates
                    </span>
                  </div>
                </Dropdown.Item>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
