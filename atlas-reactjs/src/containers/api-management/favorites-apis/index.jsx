import { AiFillHeart } from "react-icons/ai";
import { Link } from "react-router-dom";
import APIManagementLayout from "../../../components/api-management/APIManagementLayout";
import { mockAPIs } from "../../../constants";

const index = () => {
  const favoriteAPIs = mockAPIs.slice(0, 2);

  return (
    <APIManagementLayout>
      <div className="px-6 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 tracking-tight mb-2">
            Favorite <span className="text-custom-main">APIs</span>
          </h1>
          <p className="text-sm text-gray-500">
            Your most loved and bookmarked APIs for quick access.
          </p>
        </div>

        {favoriteAPIs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {favoriteAPIs.map((api, index) => (
              <div
                key={index}
                className="relative bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
              >
                {/* Filled Heart Icon */}
                <div className="absolute top-4 right-4 text-red-500">
                  <AiFillHeart size={20} />
                </div>

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
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500 text-sm">
              You haven&apos;t favorited any APIs yet.
            </p>
          </div>
        )}
      </div>
    </APIManagementLayout>
  );
};

export default index;
