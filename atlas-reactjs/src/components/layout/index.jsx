import cogoToast from "@successtar/cogo-toast";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  acknowledgePolicy,
  checkPolicyAcceptance,
  fetchPrivacyPolicy,
} from "../../redux/slices/privacy-policy";
import {
  acceptTerms,
  checkTermsStatus,
} from "../../redux/slices/terms-of-service";
import PolicyModal from "../modals/PolicyModal";
import TermsModal from "../modals/TermsModal";
import Header from "./Header";
import { SidebarPage } from "./Sidebar";
import SidebarFooter from "./SidebarFooter";

const Layout = ({ children, onSubmit }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [loading, setLoading] = useState(false);
  const routesneeded = location.pathname === "/canvas";

  useEffect(() => {
    const isPolicyPage = location.pathname === "/app/privacy-policy";
    const isTermsPage = location.pathname === "/app/terms-of-service"; 

    const fetchInitialData = async () => {
      const userId = Cookies.get("atlas_userId");
      if (!userId) return;

      // Fetch Privacy Policy (just to display date)
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

      // Check if user needs to accept Privacy Policy
      const checkPolicyResult = await dispatch(checkPolicyAcceptance(userId));
      if (checkPolicyAcceptance.fulfilled.match(checkPolicyResult)) {
        const { needsToAccept, acknowledgedAt } = checkPolicyResult.payload || {};

        if (!isPolicyPage && needsToAccept) {
          setShowPolicyModal(true);
        }
      }

      // Fetch Terms of Service status
      const termsResult = await dispatch(checkTermsStatus());
      if (checkTermsStatus.fulfilled.match(termsResult)) {
        const { showTermsModal, terms } = termsResult.payload;
        if (!isTermsPage && showTermsModal) {
          setShowTermsModal(true); // Show Terms of Service modal if needed
        }
      }
    };

    fetchInitialData();
  }, [dispatch, location.pathname]);

  const handleAcknowledgePrivacyPolicy = async () => {
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

  const handleAcceptTerms = async () => {
    setLoading(true);
    try {
      const result = await dispatch(acceptTerms());
      if (acceptTerms.fulfilled.match(result)) {
        setShowTermsModal(false);
        cogoToast.success(
          result.payload?.message || "Terms of service accepted successfully!"
        );
      } else {
        cogoToast.error(
          result.payload ||
            "Something went wrong while accepting the terms of service."
        );
      }
    } catch (error) {
      cogoToast.error(
        "Failed to accept the terms of service. Please try again."
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

      {/* Privacy Policy Modal */}
      {showPolicyModal && (
        <PolicyModal
          lastUpdated={lastUpdated}
          loading={loading}
          onAcknowledge={handleAcknowledgePrivacyPolicy}
        />
      )}

      {/* Terms of Service Modal */}
      {showTermsModal && (
        <TermsModal loading={loading} onAccept={handleAcceptTerms} />
      )}
    </div>
  );
};

export default Layout;
