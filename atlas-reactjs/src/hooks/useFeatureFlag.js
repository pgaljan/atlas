import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { fetchSubscription } from "../redux/slices/subscriptions";

const useFeatureFlag = (feature, currentUsage = 0) => {
  const userId = Cookies.get("atlas_userId");
  const [currentPlan, setCurrentPlan] = useState(null);

  if (!userId) {
    console.warn("User ID not found in cookies.");
    return false;
  }

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchSubscription(userId)).then((res) => {
      setCurrentPlan(res.payload);
    });
  }, [dispatch, userId]);

  if (!currentPlan || !currentPlan.features) return false;

  const featureValue = currentPlan.features[feature];

  // Handle boolean features
  if (typeof featureValue === "boolean") {
    return featureValue;
  }

  // Handle numeric features (like "Structures")
  if (typeof featureValue === "string" && !isNaN(featureValue)) {
    return parseInt(featureValue, 10) > currentUsage;
  }

  return false;
};

export default useFeatureFlag;
