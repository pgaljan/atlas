import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import OnboardingHeader from "../../../components/common/OnboardingHeader";
import { fetchTermsOfService } from "../../../redux/slices/terms-of-service";
import { fetchAppSettings } from "../../../redux/slices/app-settings";

const TermsOfService = () => {
  const dispatch = useDispatch();

  const appName = useSelector(
    (state) => state.appSettings.appSettings?.appName || "Atlas"
  );

  const [content, setContent] = useState("");
  const [lastUpdatedDate, setLastUpdatedDate] = useState("24 April 2025");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(fetchAppSettings());

      setIsLoading(true);
      const resultAction = await dispatch(fetchTermsOfService());
      if (fetchTermsOfService.fulfilled.match(resultAction)) {
        setContent(resultAction?.payload?.terms?.content || "");
        setLastUpdatedDate(resultAction.payload.terms.updatedAt || "N/A");
      }
      setIsLoading(false);
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
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-900">
          <span className="text-black capitalize">{appName}</span> Terms of Service
        </h1>
        <p className="text-center text-sm text-gray-500 mb-10">
          Last updated: <strong>{formattedDate}</strong>
        </p>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <div
            className="text-gray-800 space-y-5 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: content
                .replaceAll("<h1>", '<h1 class="text-2xl font-bold mt-10 text-gray-900">')
                .replaceAll("<h2>", '<h2 class="text-xl font-semibold mt-8 text-gray-800">')
                .replaceAll("<h3>", '<h3 class="text-lg font-semibold mt-6 text-gray-700">')
                .replaceAll("<p>", '<p class="text-base text-gray-700">')
                .replaceAll("<ul>", '<ul class="list-disc pl-6 space-y-2">')
                .replaceAll("<ol>", '<ol class="list-decimal pl-6 space-y-2">')
                .replaceAll("<a ", '<a class="text-blue-600 underline" ')
            }}
          />
        )}
      </div>
    </>
  );
};

export default TermsOfService;
