import React from "react";
import { Link } from "react-router-dom";

const SidebarFooter = () => {
  return (
    <div className="text-center text-sm text-gray-500 pb-4">
      <div className="flex justify-center space-x-4">
        <Link to="/app/privacy-policy" className="hover:underline">
          Privacy Policy
        </Link>
        <Link to="/app/terms-of-service" className="hover:underline">
          Terms of Service
        </Link>
      </div>
    </div>
  );
};

export default SidebarFooter;
