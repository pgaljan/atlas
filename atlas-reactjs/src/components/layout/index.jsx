import cogoToast from "@successtar/cogo-toast";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  acceptTerms,
  checkTermsStatus,
} from "../../redux/slices/terms-of-service";
import TermsModal from "../modals/TermsModal";
import Header from "./Header";
import { SidebarPage } from "./Sidebar";
import SidebarFooter from "./SidebarFooter";

const Layout = ({ children, onSubmit }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [loading, setLoading] = useState(false);
  const routesneeded = location.pathname === "/canvas";

  useEffect(() => {
    const isTermsPage = location.pathname === "/app/terms-of-service";

    const fetchInitialData = async () => {
      const termsResult = await dispatch(checkTermsStatus());
      if (checkTermsStatus.fulfilled.match(termsResult)) {
        const { showTermsModal, terms } = termsResult.payload;
        if (!isTermsPage && showTermsModal) {
          setShowTermsModal(true);
        }
        if (terms?.updatedAt) {
          setLastUpdated(
            new Date(terms.updatedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          );
        }
      }
    };

    fetchInitialData();
  }, [dispatch, location.pathname]);

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

      {/* Terms of Service Modal */}
      {showTermsModal && (
        <TermsModal
          loading={loading}
          lastUpdated={lastUpdated}
          onAccept={handleAcceptTerms}
        />
      )}
    </div>
  );
};

export default Layout;
