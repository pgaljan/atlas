import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { fetchSubscription } from "../redux/slices/subscriptions";

const useFeatureFlag = (feature, currentUsage = 0) => {
  const userId = Cookies.get("atlas_userId");
  const dispatch = useDispatch();
  const [currentPlan, setCurrentPlan] = useState(null);

  useEffect(() => {
    if (userId) {
      dispatch(fetchSubscription(userId)).then((res) => {
        setCurrentPlan(res.payload);
      });
    } else {
      console.warn("User ID not found in cookies.");
    }
  }, [dispatch, userId]);

  if (!currentPlan || !currentPlan.features) return false;

  const featureValue = currentPlan.features[feature];

  // Handle boolean feature flags
  if (typeof featureValue === "boolean") {
    return featureValue;
  }

  // Handle "Unlimited" case
  if (featureValue === "Unlimited") {
    return true;
  }

  // Handle numeric feature limits
  if (typeof featureValue === "string" && /^\d+$/.test(featureValue)) {
    return parseInt(featureValue, 10) > currentUsage;
  }

  return false;
};

export default useFeatureFlag;
