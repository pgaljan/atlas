import React, { useEffect, useState } from "react";
import Header from "./Header";
import { SidebarPage } from "./Sidebar";
import Cookies from "js-cookie";
import { Link, useLocation } from "react-router-dom";
import SidebarFooter from "./SidebarFooter";
import { useDispatch } from "react-redux";
import {
  fetchPrivacyPolicy,
  acknowledgePolicy,
  checkPolicyAcceptance,
} from "../../redux/slices/privacy-policy";
import { fetchUser } from "../../redux/slices/users";
import cogoToast from "@successtar/cogo-toast";

const Layout = ({ children, onSubmit }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [loading, setLoading] = useState(false);
  const routesneeded = location.pathname === "/canvas";

  useEffect(() => {
    const isPolicyPage = location.pathname === "/app/privacy-policy";

    const fetchInitialData = async () => {
      const userId = Cookies.get("atlas_userId");
      if (!userId) return;

      // Get current policy (just to display date)
      const policyResult = await dispatch(fetchPrivacyPolicy());
      if (fetchPrivacyPolicy.fulfilled.match(policyResult)) {
        const updatedAt = policyResult.payload.policy?.updatedAt;
        if (updatedAt) {
          setLastUpdated(
            new Date(updatedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          );
        }
      }

      // Check if user needs to accept policy
      const checkResult = await dispatch(checkPolicyAcceptance(userId));
      if (checkPolicyAcceptance.fulfilled.match(checkResult)) {
        const { needsToAccept, acknowledgedAt } = checkResult.payload || {};

        if (acknowledgedAt) {
          console.log("User previously acknowledged at:", acknowledgedAt);
        }

        if (!isPolicyPage && needsToAccept) {
          setShowPolicyModal(true);
        }
      }
    };

    fetchInitialData();
  }, [dispatch, location.pathname]);

  const handleAcknowledge = async () => {
    setLoading(true);
    try {
      const result = await dispatch(acknowledgePolicy());
      if (acknowledgePolicy.fulfilled.match(result)) {
        setShowPolicyModal(false);
        cogoToast.success(
          result.payload?.message || "Privacy policy acknowledged successfully!"
        );
      } else {
        cogoToast.error(
          result.payload ||
            "Something went wrong while acknowledging the policy."
        );
      }
    } catch (error) {
      cogoToast.error(
        "Failed to acknowledge the privacy policy. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen relative">
      {!routesneeded && <Header />}
      <div className="flex flex-grow overflow-hidden">
        {!routesneeded && (
          <div className="w-64 flex flex-col justify-between bg-gray-50">
            <SidebarPage onSubmit={onSubmit} />
            <SidebarFooter />
          </div>
        )}
        <main className="flex-1 bg-gray-200 p-2 overflow-auto">{children}</main>
      </div>

      {/* Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md mx-4 p-8 rounded-2xl shadow-2xl animate-fade-in">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Privacy Policy Update
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                Please read and acknowledge our{" "}
                <a
                  href="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Privacy Policy
                </a>{" "}
                before using the platform.
              </p>
              {lastUpdated && (
                <p className="text-xs text-gray-800 mt-1">
                  Last updated: {lastUpdated}
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-4">
              <Link to="/app/privacy-policy">
                <button className="bg-gray-200 hover:bg-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition-all">
                  View Policy
                </button>
              </Link>
              <button
                onClick={handleAcknowledge}
                className={`${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-custom-main"
                } hover:bg-custom-main/50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-all`}
                disabled={loading}
              >
                {loading ? "Loading..." : "I Acknowledge"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
