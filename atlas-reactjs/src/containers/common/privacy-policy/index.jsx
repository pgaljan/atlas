import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPrivacyPolicy } from "../../../redux/slices/privacy-policy";
import { fetchAppSettings } from "../../../redux/slices/app-settings";
import OnboardingHeader from "../../../components/common/OnboardingHeader";

const PrivacyPolicy = () => {
  const dispatch = useDispatch();

  
  const [lastUpdatedDate, setLastUpdatedDate] = useState("24 April 2025");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch app settings if not already loaded
      await dispatch(fetchAppSettings());

      // Fetch privacy policy
      setLoading(true);
      const resultAction = await dispatch(fetchPrivacyPolicy());
      if (fetchPrivacyPolicy.fulfilled.match(resultAction)) {
        setContent(resultAction?.payload?.policy?.content || "");
        setLastUpdatedDate(resultAction.payload.policy.updatedAt || "N/A");
      }
      setLoading(false);
    };

    fetchData();
  }, [dispatch]);

  const formattedDate = new Date(lastUpdatedDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <OnboardingHeader />
      <div className="w-full max-w-4xl mx-auto px-4 pt-12 pb-24">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-4">
          <span className="text-black"></span> Privacy Policy
        </h1>

        <p className="text-sm text-gray-500 text-center mb-10">
          Last updated: <strong>{formattedDate}</strong>
        </p>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <div
            className="prose max-w-none prose-headings:text-blue-600 prose-p:text-gray-800 prose-a:text-blue-600 prose-a:underline prose-strong:font-semibold"
            style={{
              counterReset: "section",
            }}
            dangerouslySetInnerHTML={{
              __html: content.replace(/<h(\d)>/g, "<h$1 class='no-counter'>"),
            }}
          />
        )}
      </div>
    </>
  );
};

export default PrivacyPolicy;
