import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { fetchPrivacyPolicy } from "../../../redux/slices/privacy-policy";
import Layout from "../../../components/layout";

const PrivacyPolicy = () => {
  const dispatch = useDispatch();
  const [lastUpdatedDate, setLastUpdatedDate] = useState("24 April 2025");
  const [content, setContent] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const resultAction = await dispatch(fetchPrivacyPolicy());
      if (fetchPrivacyPolicy.fulfilled.match(resultAction)) {
        setContent(resultAction?.payload?.policy?.content || "");
        setLastUpdatedDate(resultAction.payload.policy.updatedAt || "N/A");
      }
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
        <div className="text-sm text-gray-500">
          <span className="block">
            Last updated: <strong>{formattedDate}</strong>
          </span>
        </div>
        <ReactQuill value={content} readOnly={true} theme="bubble" />
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
