import cogoToast from "@successtar/cogo-toast";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  acceptTerms,
  checkTermsStatus,
} from "../../redux/slices/terms-of-service";
import TermsModal from "../modals/TermsModal";
import UpgradePlanModal from "../modals/UpgradePlanModal";
import APIManagementHeader from "./APIManagementHeader";
import APIManagementSidebar from "./APIManagementSidebar";

// Constants
const ROUTES_EXCLUDED = ["/canvas"];
const TERMS_ROUTE = "/api-management/terms-of-service";

const APIManagementLayout = ({ children }) => {
  const location = useLocation();
  const dispatch = useDispatch();

  const [showTermsModal, setShowTermsModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const isExcludedRoute = ROUTES_EXCLUDED.includes(location.pathname);
  const isTermsPage = location.pathname === TERMS_ROUTE;

  useEffect(() => {
    const fetchTermsStatus = async () => {
      const result = await dispatch(checkTermsStatus());

      if (checkTermsStatus.fulfilled.match(result)) {
        const { showTermsModal, terms } = result.payload;

        if (showTermsModal && !isTermsPage) {
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

    fetchTermsStatus();
  }, [dispatch, location.pathname]);

  const handleAcceptTerms = async () => {
    setLoading(true);
    try {
      const result = await dispatch(acceptTerms());

      if (acceptTerms.fulfilled.match(result)) {
        setShowTermsModal(false);
        cogoToast.success(
          result.payload?.message || "Terms accepted successfully!"
        );
      } else {
        cogoToast.error(result.payload || "Something went wrong.");
      }
    } catch {
      cogoToast.error("Failed to accept terms.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen relative">
      {!isExcludedRoute && <APIManagementHeader />}

      <div className="flex flex-grow overflow-hidden">
        {!isExcludedRoute && (
          <div className="w-64 flex flex-col justify-between bg-gray-50">
            <APIManagementSidebar />
          </div>
        )}

        <main className="flex-1 bg-gray-100 p-4 overflow-auto dark:bg-gray-900">
          {children}
        </main>
      </div>

      {showUpgradeModal && <UpgradePlanModal />}

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

export default APIManagementLayout;
