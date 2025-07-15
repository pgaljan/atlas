import cogoToast from "@successtar/cogo-toast";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { FaUpload, FaTrash } from "react-icons/fa";
import { useDispatch } from "react-redux";
import Layout from "../../../components/layout";
import {
  uploadAnonymousFile,
  uploadFile,
} from "../../../redux/slices/upload-files";
import {
  changePassword,
  fetchUser,
  updateUser,
} from "../../../redux/slices/users";

const UserSettings = () => {
  const dispatch = useDispatch();
  const userId = Cookies.get("atlas_userId");
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [profileImage, setProfileImage] = useState("/assets/userimg.jpeg");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const user = await dispatch(fetchUser(userId)).unwrap();
        setDisplayName(user.displayName || "");
        setProfileImage(user.profileUrl || "/assets/userimg.jpeg");
      } catch (err) {
        cogoToast.error("Failed to load user settings.");
      }
    })();
  }, [userId, dispatch]);

  const handleUpload = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      const uploaded = await dispatch(uploadFile({ file, userId })).unwrap();

      const url = uploaded.fileUrl || uploaded.url;

      if (url) {
        setProfileImage(url);
        cogoToast.success("Logo uploaded successfully.");
      } else {
        cogoToast.error("No URL returned from upload.");
      }
    } catch (err) {
      cogoToast.error("Upload failed.");
    }
  };

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      return cogoToast.error("Display name is required.");
    }

    setLoading(true);
    try {
      await dispatch(
        updateUser({
          userId,
          updateData: {
            displayName,
            profileUrl: profileImage,
          },
        })
      ).unwrap();
      cogoToast.success("Profile updated!");
    } catch (err) {
      cogoToast.error(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword.trim() || !newPassword.trim()) {
      return cogoToast.error("Please fill both password fields.");
    }

    setLoading(true);
    try {
      await dispatch(
        changePassword({
          userId,
          oldPassword: currentPassword,
          newPassword,
        })
      ).unwrap();
      cogoToast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      cogoToast.error(err.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 sm:p-10 bg-white rounded-[18px] shadow-md min-h-[90%] space-y-8">
        <h2 className="text-3xl font-semibold text-gray-800">User Settings</h2>

        {/* Section 1: Personal Info */}
        <div className="border rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Personal Information
          </h3>

          <div className="flex items-center gap-6 mb-6">
            <img
              src={profileImage}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border"
            />
            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-custom-main text-white rounded-lg shadow hover:bg-custom-secondary transition">
              <FaUpload className="w-4 h-4" />
              Upload New
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-2">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter display name"
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-custom-main"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleUpdateProfile}
              disabled={loading}
              className={`px-6 py-2 rounded-lg text-white text-sm font-semibold transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-custom-main hover:bg-custom-secondary"
              }`}
            >
              {loading ? "Saving..." : "Save Personal Info"}
            </button>
          </div>
        </div>

        {/* Section 2: Change Password */}
        <div className="border rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Change Password
          </h3>

          <div className="mb-4">
            <label className="block font-medium mb-2">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-custom-main"
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-custom-main"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleChangePassword}
              disabled={loading}
              className={`px-6 py-2 rounded-lg text-white text-sm font-semibold transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-custom-main hover:bg-custom-secondary"
              }`}
            >
              {loading ? "Saving..." : "Change Password"}
            </button>
          </div>
        </div>

        {/* Section 3: Delete Account */}
        <div className="border rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-red-600 mb-4">
            Danger Zone
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Deleting your account is irreversible. Please proceed with caution.
          </p>
          <button
            onClick={() => cogoToast.warn("Delete account logic coming soon")}
            className="flex items-center gap-2 px-5 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition"
          >
            <FaTrash className="w-4 h-4" />
            Delete Account
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default UserSettings;
