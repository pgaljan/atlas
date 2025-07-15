import { FiArrowRightCircle, FiHeart } from "react-icons/fi";
import { Link } from "react-router-dom";
import APIManagementLayout from "../../../components/api-management/APIManagementLayout";
import { apiCategories, mockAPIs, topCollections } from "../../../constants";

const pastelBgColors = [
  "bg-pink-100",
  "bg-yellow-100",
  "bg-green-100",
  "bg-blue-100",
  "bg-purple-100",
  "bg-amber-100",
  "bg-rose-100",
  "bg-sky-100",
];

const index = () => {
  return (
    <APIManagementLayout>
      <div className="px-6 py-6">
        {/* Search Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 tracking-tight mb-2">
            Welcome to{" "}
            <span className="text-custom-main">Atlas API Management</span>
          </h1>

          <p className="text-sm text-gray-500">
            Discover APIs, manage your assets, and analyze usage performance.
          </p>
        </div>

        {/* Top Categories */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Top Categories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {apiCategories.map((cat, idx) => (
              <div
                key={idx}
                className="group bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all hover:border-custom-main hover:scale-[1.015] flex flex-col"
              >
                {/* Icon Badge with Dynamic Pastel Color */}
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full text-custom-main font-bold text-sm mb-4 ${
                    pastelBgColors[idx % pastelBgColors.length]
                  }`}
                >
                  {cat.name.charAt(0)}
                </div>

                {/* Category Title */}
                <h3 className="font-semibold text-gray-900 text-base mb-1">
                  {cat.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-500 leading-snug flex-grow">
                  {cat.description}
                </p>

                {/* Footer CTA */}
                <div className="mt-auto pt-4">
                  <button className="flex items-center text-sm text-custom-main font-medium hover:underline">
                    Browse Category{" "}
                    <FiArrowRightCircle className="ml-2" size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API Cards Section */}
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Best For Your Daily Routine
          </h2>
          <Link
            to="/api-management/apis"
            className="text-sm text-custom-main hover:underline"
          >
            View All APIs
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {mockAPIs.map((api, index) => (
            <div
              key={index}
              className="relative bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
            >
              {/* Favorite Button */}
              <button
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500 transition"
                title="Favorite"
              >
                <FiHeart size={18} />
              </button>

              {/* Category Label */}
              <div className="text-xs text-white bg-gray-700 rounded-full px-3 py-0.5 mb-3 inline-block">
                {api.category}
              </div>

              {/* API Title */}
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                {api.name}
              </h3>

              <p className="text-sm text-gray-500 mb-1 truncate">
                By {api.provider}
              </p>
              <p className="text-xs text-gray-400 mb-4">
                Updated {api.updated}
              </p>

              {/* Stats Row */}
              <div className="flex text-xs text-gray-600 justify-between mb-4">
                <span>🚀 {api.latency}</span>
                <span>✅ {api.uptime}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/api-management/try-it"
                  className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md font-medium"
                >
                  Try It
                </Link>
                <Link
                  to="/api-management/api-templates"
                  className="text-sm px-3 py-1.5 bg-custom-main text-white hover:bg-custom-main/90 rounded-md font-medium"
                >
                  View Docs
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Top Collections */}
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Top Collections
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {topCollections.map((_, i) => (
              <div
                key={i}
                className="group relative bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all hover:border-custom-main hover:scale-[1.015] flex flex-col"
              >
                {/* Header Icon */}
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full text-custom-main font-bold text-sm mb-4 ${
                    pastelBgColors[i % pastelBgColors.length]
                  }`}
                >
                  {topCollections[i].icon}
                </div>

                {/* Collection Name */}
                <h3 className="font-semibold text-gray-900 text-base mb-1">
                  {topCollections[i].name}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-500 leading-snug flex-grow">
                  {topCollections[i].description}
                </p>

                {/* View Button */}
                <div className="mt-auto pt-4">
                  <button className="flex items-center text-sm text-custom-main font-medium hover:underline">
                    Explore Collection{" "}
                    <FiArrowRightCircle className="ml-2" size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </APIManagementLayout>
  );
};

export default index;
