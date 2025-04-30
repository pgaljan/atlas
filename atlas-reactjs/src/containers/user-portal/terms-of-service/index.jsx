import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { fetchTermsOfService } from "../../../redux/slices/terms-of-service";
import Layout from "../../../components/layout";

const TermsOfService = () => {
  const dispatch = useDispatch();
  const [content, setContent] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const resultAction = await dispatch(fetchTermsOfService());
      if (fetchTermsOfService.fulfilled.match(resultAction)) {
        setContent(resultAction?.payload?.terms?.content || "");
      }
    };

    fetchData();
  }, [dispatch]);

  return (
    <Layout>
      <div className="bg-white shadow rounded-[18px] p-8 m-2">
        <h1 className="text-2xl font-bold mb-4">Terms of Service</h1>
        <ReactQuill value={content} readOnly={true} theme="bubble" />
      </div>
    </Layout>
  );
};

export default TermsOfService;
