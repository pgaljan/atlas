import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css";
import { useDispatch } from "react-redux";
import Layout from "../../../components/layout";
import { fetchPrivacyPolicy } from "../../../redux/slices/privacy-policy";

const PrivacyPolicy = () => {
  const dispatch = useDispatch();
  const [lastUpdatedDate, setLastUpdatedDate] = useState("24 April 2025");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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
    <Layout>
      <div className="bg-white shadow rounded-[18px] p-8 m-2">
        <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
        <div className="text-sm text-gray-500 mb-4">
          <span className="block">
            Last updated: <strong>{formattedDate}</strong>
          </span>
        </div>
        {loading ? (
          <div className="flex h-screen flex-col text-center p-6">
            <div className="absolute inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-custom-main border-t-transparent"></div>
            </div>
          </div>
        ) : (
          <ReactQuill value={content} readOnly={true} theme="bubble" />
        )}
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
