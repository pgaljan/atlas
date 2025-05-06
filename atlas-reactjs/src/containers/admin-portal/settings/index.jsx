import React, { useState, useEffect } from "react";
import { FaUpload } from "react-icons/fa";
import { useDispatch } from "react-redux";
import cogoToast from "@successtar/cogo-toast";
import AdminLayout from "../../../components/admin/admin-layout";
import {
  saveAppSettings,
  fetchAppSettings,
} from "../../../redux/slices/app-settings";
import { uploadAnonymousFile } from "../../../redux/slices/upload-files";

const Settings = () => {
  const dispatch = useDispatch();
  const [logoUrl, setLogoUrl] = useState("/assets/atlas-logo.png");
  const [feedbackLink, setFeedbackLink] = useState("");
  const [appName, setAppName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const resultAction = await dispatch(fetchAppSettings());
        if (fetchAppSettings.fulfilled.match(resultAction)) {
          const settings = resultAction?.payload;
          if (settings) {
            setLogoUrl(settings.logoUrl || "/assets/atlas-logo.png");
            setAppName(settings.appName || "");
            setSupportEmail(settings.supportEmail || "");
            setFeedbackLink(settings.feedbackLink || "");
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    loadSettings();
  }, [dispatch]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploaded = await dispatch(uploadAnonymousFile(file)).unwrap();
      const url = uploaded.fileUrl || uploaded.url;

      if (url) {
        setLogoUrl(url);
        cogoToast.success("Logo uploaded successfully.");
      } else {
        cogoToast.error("No URL returned from upload.");
      }
    } catch (err) {
      cogoToast.error("Upload failed.");
    }
  };

  const handleFeedbackSubmit = async () => {
    try {
      setLoading(true);
      await dispatch(
        saveAppSettings({ logoUrl, feedbackLink, appName, supportEmail })
      ).unwrap();
      cogoToast.success("Feedback link saved successfully.");
    } catch (err) {
      cogoToast.error("Failed to save feedback link.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAllSettings = async () => {
    try {
      setLoading(true);
      await dispatch(
        saveAppSettings({ logoUrl, feedbackLink, appName, supportEmail })
      ).unwrap();
      cogoToast.success("App settings saved successfully.");
    } catch (err) {
      cogoToast.error("Failed to save app settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 sm:p-10 bg-custom-background-white rounded-[18px] shadow-md min-h-[90%]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <h2 className="text-3xl font-semibold text-custom-text-heading">
            App Settings
          </h2>
        </div>

        {/* Logo Section */}
        <section className="bg-white p-6 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <img
              src={logoUrl}
              alt="App Logo"
              className="w-24 h-24 rounded-full object-cover border"
            />
            <div>
              <p className="text-lg font-medium">Current Logo</p>
              <p className="text-sm text-gray-500">Recommended: 200x200 PNG</p>
            </div>
          </div>

          <label className="cursor-pointer flex items-center gap-2 rounded-lg bg-custom-main px-4 py-2 text-sm font-medium text-white shadow hover:bg-red-800 transition">
            <FaUpload className="w-4 h-4" />
            Upload New
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </label>
        </section>

        {/* App Name */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
          <h3 className="text-xl font-semibold mb-4">App Name</h3>
          <input
            type="text"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            placeholder="Enter app name"
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-custom-main"
          />
        </section>

        {/* Support Email */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
          <h3 className="text-xl font-semibold mb-4">Support Email</h3>
          <input
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            placeholder="Enter support email"
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-custom-main"
          />
        </section>

        {/* Feedback Link */}
        <section className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">Feedback Link</h3>
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <input
              id="feedbackLink"
              type="url"
              value={feedbackLink}
              onChange={(e) => setFeedbackLink(e.target.value)}
              placeholder="https://example.com/feedback"
              className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-custom-main"
            />
          </div>
        </section>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveAllSettings}
            disabled={loading}
            className={`px-6 py-2 rounded-lg text-white text-sm font-semibold transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-custom-main hover:bg-red-800"
            }`}
          >
            {loading ? "Saving..." : "Save All Settings"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;
