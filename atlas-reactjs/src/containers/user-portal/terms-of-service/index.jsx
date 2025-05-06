import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css";
import { fetchTermsOfService } from "../../../redux/slices/terms-of-service";
import Layout from "../../../components/layout";

const TermsOfService = () => {
  const dispatch = useDispatch();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const resultAction = await dispatch(fetchTermsOfService());
      if (fetchTermsOfService.fulfilled.match(resultAction)) {
        setContent(resultAction?.payload?.terms?.content || "");
      }
      setIsLoading(false);
    };

    fetchData();
  }, [dispatch]);

  return (
    <Layout>
      <div className="bg-white shadow rounded-[18px] p-8 m-2">
        <h1 className="text-2xl font-bold mb-4">Terms of Service</h1>
        {isLoading ? (
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

export default TermsOfService;
