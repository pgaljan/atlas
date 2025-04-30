import React from "react";
import { Link } from "react-router-dom";

const TermsModal = ({ loading, onAccept }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="bg-white w-full max-w-md mx-4 p-8 rounded-2xl shadow-2xl animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Terms of Service Update</h2>
        <p className="text-sm text-gray-500 mt-2">
          Please read and acknowledge our{" "}
          <a
            href="/app/terms-of-service"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Terms of Service
          </a>{" "}
          before using the platform.
        </p>
      </div>
      <div className="flex justify-end space-x-4">
        <Link to="/app/terms-of-service">
          <button className="bg-gray-200 hover:bg-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition-all">
            View Terms
          </button>
        </Link>
        <button
          onClick={onAccept}
          className={`${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-custom-main"
          } hover:bg-custom-main/50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-all`}
          disabled={loading}
        >
          {loading ? "Loading..." : "I Accept"}
        </button>
      </div>
    </div>
  </div>
);

export default TermsModal;
