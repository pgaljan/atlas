import React, { useState, useEffect } from "react";
import AdminLayout from "../../../components/admin/admin-layout";
import QuillEditor from "../../../components/editors/quill.editor";
import { useDispatch } from "react-redux";
import {
  saveOrUpdatePrivacyPolicy,
  fetchPrivacyPolicy,
} from "../../../redux/slices/privacy-policy";
import cogoToast from "@successtar/cogo-toast";

const AdminPrivacyPolicy = () => {
  const dispatch = useDispatch();
  const [policyText, setPolicyText] = useState("");
  const [lastUpdatedDate, setLastUpdatedDate] = useState("24 April 2025");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch the privacy policy when the component mounts
  useEffect(() => {
    dispatch(fetchPrivacyPolicy())
      .then((response) => {
        if (response?.payload) {
          setPolicyText(response?.payload?.policy?.content);
          setLastUpdatedDate(response?.payload?.policy?.updatedAt || "N/A");
        }
      })
      .catch((error) => {
        cogoToast.error("Error fetching privacy policy: " + error.message);
      });
  }, [dispatch]);

  const handleSavePolicy = () => {
    setIsSaving(true);
    const policyData = {
      content: policyText,
    };

    dispatch(saveOrUpdatePrivacyPolicy(policyData))
      .then((response) => {
        cogoToast.success("Privacy policy saved/updated successfully.");
      })
      .catch((error) => {
        cogoToast.error(
          "Error saving/updating privacy policy: " + error.message
        );
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const formattedDate = new Date(lastUpdatedDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <AdminLayout>
      <div className="p-4">
        <div className="p-10 rounded-[18px] bg-custom-background-white h-auto max-h-[90%] shadow-md">
          <div className="mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Privacy Policy
            </h1>
            <div className="text-sm text-gray-500">
              <span className="block">
                Last updated: <strong>{formattedDate}</strong>
              </span>
            </div>
          </div>

          <div className="mb-4 text-gray-500">
            <p>
              Customize your privacy policy to ensure customer trust and legal
              compliance.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-6">
            <QuillEditor
              content={policyText}
              onEditorChange={(val) => setPolicyText(val)}
              editorClassName="h-[450px] mb-[50px]"
            />
          </div>

          <div className="flex items-center justify-end">
            <button
              className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg bg-custom-main text-white"
              onClick={handleSavePolicy}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPrivacyPolicy;
