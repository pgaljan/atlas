import cogoToast from "@successtar/cogo-toast";
import CryptoJS from "crypto-js";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchSubscription } from "../../../redux/slices/subscriptions";

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userData, setUserData] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);

  useEffect(() => {
    const encryptedData = searchParams.get("token");

    if (!encryptedData) {
      cogoToast.error("No encrypted data found in URL");
      navigate("/");
      return;
    }

    try {
      const [ivHex, encryptedTextHex] = encryptedData.split(":");
      const secretKeyHex = import.meta.env.VITE_APP_ENCRYPTION_SECRET;

      if (!secretKeyHex || secretKeyHex.length !== 64) {
        throw new Error(
          "Invalid ENCRYPTION_SECRET. Must be a 64-character hex string."
        );
      }

      const secretKey = CryptoJS.enc.Hex.parse(secretKeyHex);
      const iv = CryptoJS.enc.Hex.parse(ivHex);
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedTextHex, secretKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      const decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8);
      if (!decryptedString) {
        throw new Error("Decryption failed. Empty string received.");
      }

      const parsedUserData = JSON.parse(decryptedString);

      if (parsedUserData?.token) {
        Cookies.set("atlas_access_token", parsedUserData.token, { expires: 1 });
        Cookies.set("atlas_userId", parsedUserData.userId, { expires: 1 });
        Cookies.set("atlas_email", parsedUserData.email, { expires: 1 });
        Cookies.set("atlas_username", parsedUserData.username, { expires: 1 });

        setUserData(parsedUserData); // Store user data in state

        cogoToast.success("Login successful!");
      } else {
        cogoToast.error("Invalid decrypted data");
        navigate("/");
      }
    } catch (error) {
      cogoToast.error("Error decrypting data");
      console.error("Error decrypting data:", error);
      navigate("/");
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    if (userData?.userId) {
      dispatch(fetchSubscription(userData.userId)).then((res) => {
        if (res.payload) {
          setCurrentPlan(res.payload.plan.name);
        }
      });
    }
  }, [userData, dispatch]);

  useEffect(() => {
    if (currentPlan) {
      if (currentPlan === "Personal") {
        navigate(`/subscription-plans?userId=${userData.userId}`);
      } else {
        navigate("/app/dashboard");
      }
    }
  }, [currentPlan, navigate, userData]);

  return (
    <div className="absolute inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-custom-main border-t-transparent"></div>
    </div>
  );
};

export default GoogleCallback;