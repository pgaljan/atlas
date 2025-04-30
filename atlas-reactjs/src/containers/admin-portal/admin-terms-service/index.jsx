import React, { useState, useEffect } from "react";
import AdminLayout from "../../../components/admin/admin-layout";
import QuillEditor from "../../../components/editors/quill.editor";
import { useDispatch } from "react-redux";
import {
  saveOrUpdateTermsOfService,
  fetchTermsOfService,
} from "../../../redux/slices/terms-of-service";
import cogoToast from "@successtar/cogo-toast";

const AdminTermsService = () => {
  const [termsText, setTermsText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const dispatch = useDispatch();

  // Fetch the terms of service when the component mounts
  useEffect(() => {
    dispatch(fetchTermsOfService())
      .then((response) => {
        if (response.payload) {
          setTermsText(response?.payload?.terms?.content);
        }
      })
      .catch((error) => {
        cogoToast.error("Error fetching terms of service: " + error.message);
      });
  }, [dispatch]);

  const handleSaveTerms = () => {
    setIsSaving(true);
    const termsData = {
      content: termsText,
    };

    dispatch(saveOrUpdateTermsOfService(termsData))
      .then((response) => {
        cogoToast.success("Terms of service saved/updated successfully.");
      })
      .catch((error) => {
        cogoToast.error(
          "Error saving/updating terms of service: " + error.message
        );
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return (
    <AdminLayout>
      <div className="p-4">
        <div className="p-10 rounded-[18px] bg-custom-background-white h-auto max-h-[90%] shadow-md">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Terms Of Service
          </h1>

          <div className="mb-4 text-gray-500">
            <p>Set your terms of services</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-6">
            <QuillEditor
              content={termsText}
              onEditorChange={(val) => setTermsText(val)}
              editorClassName="h-[450px] mb-[50px]"
            />
          </div>

          <div className="flex items-center justify-end">
            <button
              className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg bg-custom-main text-white"
              onClick={handleSaveTerms}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminTermsService;
