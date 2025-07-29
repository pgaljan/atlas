import { FiHeart } from "react-icons/fi";
import { Link } from "react-router-dom";
import APIManagementLayout from "../../../components/api-management/APIManagementLayout";
import { mockAPIs } from "../../../constants";

const index = () => {
  return (
    <APIManagementLayout>
      <div className="px-6 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 tracking-tight mb-2">
            All <span className="text-custom-main">APIs</span>
          </h1>
          <p className="text-sm text-gray-500">
            Browse the full collection of APIs available on the platform.
          </p>
        </div>

        {/* API Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {mockAPIs.map((api, index) => (
            <div
              key={index}
              className="relative bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
            >
              {/* Heart Icon */}
              <button
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500 transition"
                title="Favorite"
              >
                <FiHeart size={18} />
              </button>

              {/* Category */}
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

              {/* Stats */}
              <div className="flex text-xs text-gray-600 justify-between mb-4">
                <span>🚀 {api.latency}</span>
                <span>✅ {api.uptime}</span>
              </div>

              {/* Actions */}
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
      </div>
    </APIManagementLayout>
  );
};

export default index;
