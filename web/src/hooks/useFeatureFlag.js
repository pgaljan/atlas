import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchSubscription } from "../redux/slices/subscriptions";

const useFeatureFlag = (feature, currentUsage = 0) => {
  const dispatch = useDispatch();
  const userId = Cookies.get("atlas_userId");
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

  if (typeof featureValue === "boolean") {
    return featureValue;
  }

  if (featureValue === "Unlimited") {
    return true;
  }

  if (typeof featureValue === "string" && /^\d+$/.test(featureValue)) {
    return parseInt(featureValue, 10) > currentUsage;
  }

  return false;
};

export default useFeatureFlag;
