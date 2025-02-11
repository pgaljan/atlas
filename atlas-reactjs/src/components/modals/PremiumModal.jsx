import React from "react";
import Icons from "../../constants/icons";
import { FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";

const PremiumModal = ({ closeModal }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg text-center">
        <div className="flex -mt-2 justify-end">
          <button
            className="text-gray-500 hover:text-gray-700 text-xl"
            onClick={closeModal} 
          >
            <FaTimes />
          </button>
        </div>

        <div className="mt-6">
          {/* Premium Icon */}
          <div className="mb-4 flex justify-center">
            <Icons.PremiumIcon className="w-24 h-24 fill-current text-red-600" />
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Unlock Premium Features
          </h2>

          {/* Description */}
          <p className="text-gray-600 text-lg mb-6">
            Enjoy{" "}
            <span className="text-custom-main font-semibold">
              unlimited access
            </span>{" "}
            to exclusive tools, priority support, and much more.
          </p>

          {/* Upgrade Button */}
          <Link
            to="/app/upgrade-plans"
            className="bg-custom-main text-white text-lg px-8 py-3 rounded-full"
          >
            Upgrade Now
          </Link>

          {/* Additional Information */}
          <div className="mt-6 text-gray-500 text-sm">
            <p>
              Upgrade today and enjoy a seamless experience with all the premium
              benefits.{" "}
              <span className="font-semibold text-gray-800">
                No commitment, cancel anytime.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;
