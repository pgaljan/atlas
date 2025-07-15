import React, { useState } from "react";
import APIManagementLayout from "../../../components/api-management/APIManagementLayout";
import { apiCategories, topCollections, mockAPIs } from "../../../constants";
import { FiArrowRightCircle } from "react-icons/fi";
import { Link } from "react-router-dom";

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

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);

  const filteredAPIs = mockAPIs.filter((api) => {
    if (selectedCategory) return api.category === selectedCategory;
    if (selectedCollection) return api.collection === selectedCollection;
    return true;
  });

  return (
    <APIManagementLayout>
      <div className="px-6 py-6 space-y-12">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-1">
            Explore <span className="text-custom-main">APIs</span>
          </h1>
          <p className="text-sm text-gray-500">
            Browse APIs organized by categories and curated collections.
          </p>
        </div>

        {/* Categories Section */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            API Categories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {apiCategories.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  setSelectedCollection(null);
                }}
                className="cursor-pointer group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all hover:border-custom-main hover:scale-[1.02] flex flex-col"
              >
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-xl text-custom-main font-bold text-lg mb-4 ${
                    pastelBgColors[idx % pastelBgColors.length]
                  }`}
                >
                  {cat.name.charAt(0)}
                </div>
                <h3 className="font-semibold text-gray-900 text-base mb-1">
                  {cat.name}
                </h3>
                <p className="text-sm text-gray-500 leading-snug flex-grow">
                  {cat.description}
                </p>
                <div className="mt-auto pt-4">
                  <button className="flex items-center text-sm text-custom-main font-medium hover:underline">
                    Browse Category
                    <FiArrowRightCircle className="ml-2" size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Collections Section */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Top Collections
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {topCollections.map((col, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedCollection(col.name);
                  setSelectedCategory(null);
                }}
                className="cursor-pointer group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all hover:border-custom-main hover:scale-[1.02] flex flex-col"
              >
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-xl text-custom-main font-bold text-lg mb-4 ${
                    pastelBgColors[idx % pastelBgColors.length]
                  }`}
                >
                  {col.icon}
                </div>
                <h3 className="font-semibold text-gray-900 text-base mb-1">
                  {col.name}
                </h3>
                <p className="text-sm text-gray-500 leading-snug flex-grow">
                  {col.description}
                </p>
                <div className="mt-auto pt-4">
                  <button className="flex items-center text-sm text-custom-main font-medium hover:underline">
                    Explore Collection
                    <FiArrowRightCircle className="ml-2" size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Filtered APIs */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {selectedCategory
              ? `APIs in "${selectedCategory}"`
              : selectedCollection
              ? `APIs in "${selectedCollection}"`
              : "Featured APIs"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAPIs.slice(0, 6).map((api, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="text-xs text-white bg-gray-700 rounded-full px-3 py-0.5 mb-3 inline-block">
                  {api.category}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  {api.name}
                </h3>
                <p className="text-sm text-gray-500 mb-1 truncate">
                  By {api.provider}
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  Updated {api.updated}
                </p>
                <div className="flex text-xs text-gray-600 justify-between mb-4">
                  <span>🚀 {api.latency}</span>
                  <span>✅ {api.uptime}</span>
                </div>
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
        </section>
      </div>
    </APIManagementLayout>
  );
};

export default Index;
