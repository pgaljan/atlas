import cogoToast from "@successtar/cogo-toast";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { TbEdit } from "react-icons/tb";
import { useDispatch } from "react-redux";
import Layout from "../../../components/layout";
import DeleteModal from "../../../components/modals/DeleteModal";
import { uploadFile } from "../../../redux/slices/upload-files";
import {
  changePassword,
  deleteUser,
  fetchUser,
  updateUser,
} from "../../../redux/slices/users";

const UserSettings = () => {
  const dispatch = useDispatch();
  const userId = Cookies.get("atlas_userId");
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [profileImage, setProfileImage] = useState("/assets/userimg.jpeg");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFarewellModal, setShowFarewellModal] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);
    (async () => {
      try {
        const user = await dispatch(fetchUser(userId)).unwrap();
        setDisplayName(user.displayName || "");
        setProfileImage(user.profileUrl || "/assets/userimg.jpeg");
      } catch (err) {
        console.log(err);
        cogoToast.error("Failed to load user settings.");
      } finally {
        setIsLoading(false);
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
      console.log(err)
      cogoToast.error("Upload failed.");
    }
  };

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      return cogoToast.error("Display name is required.");
    }

    setLoading(true);
    try {
      const updatedUser = await dispatch(
        updateUser({
          userId,
          updateData: {
            displayName,
            profileUrl: profileImage,
          },
        })
      ).unwrap();

      Cookies.set("displayName", updatedUser.displayName);
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

  const handleDelete = () => {
    console.log("Project deleted");
    setShowConfirm(false);
  };

  return (
    <Layout>
      {isLoading ? (
        <div className="flex h-screen flex-col text-center p-6">
          <div className="absolute inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-custom-main border-t-transparent"></div>
          </div>
        </div>
      ) : (
        <div className="p-6 sm:p-10 bg-white rounded-[18px] shadow-md min-h-[90%] space-y-8">
          <h2 className="text-3xl font-semibold text-gray-800">
            Settings
          </h2>

          {/* Section 1: Personal Info */}
          <div className="border rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Personal Information
            </h3>

            {/* <div className="relative w-24 h-24 mb-6 group">
              <img
                src={profileImage}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border"
              />
              <label className="absolute bottom-3 -right-3 bg-white border border-gray-300 shadow rounded-full p-2 hover:bg-gray-100 cursor-pointer opacity-0 group-hover:opacity-100 transition">
                <TbEdit className="w-4 h-4 text-gray-700" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
              </label>
            </div> */}

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
              Deleting your account is irreversible. Please proceed with
              caution.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-5 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition"
            >
              <FaTrash className="w-4 h-4" />
              Delete Account
            </button>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <DeleteModal
          isOpen={showDeleteModal}
          title="Account"
          onClose={() => setShowDeleteModal(false)}
          onConfirm={async () => {
            setLoading(true);
            try {
              await dispatch(
                deleteUser({ userId, reason: "User requested deletion" })
              ).unwrap();

              // Cleanup
              Cookies.remove("atlas_access_token");
              Cookies.remove("atlas_userId");
              Cookies.remove("atlas_username");
              Cookies.remove("atlas_email");
              Cookies.remove("workspaceId");
              localStorage.clear();

              // Show toast and farewell modal
              cogoToast.success("Account deleted successfully.");
              setShowDeleteModal(false);
              setShowFarewellModal(true);

              // Redirect after 3 seconds
              setTimeout(() => {
                window.location.href = "/";
              }, 3000);
            } catch (err) {
              cogoToast.error(err?.message || "Failed to delete account.");
              setShowDeleteModal(false);
            } finally {
              setLoading(false);
            }
          }}
        />
      )}
      {showFarewellModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-gradient-to-br from-white via-gray-100 to-white rounded-2xl shadow-2xl px-8 py-10 w-full max-w-md text-center relative">
            <div className="text-6xl mb-4 animate-pulse text-red-400">😢</div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-3">
              We&apos;re sorry to see you go!
            </h2>
            <p className="text-gray-600 mb-6">
              Your account has been permanently deleted. We hope to see you
              again someday.
            </p>

            <div className="flex justify-center gap-4">
              <button
                disabled
                className="px-5 py-2 text-sm font-semibold text-gray-400 bg-gray-200 rounded-lg cursor-not-allowed"
              >
                👋 Good bye
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="px-5 py-2 text-sm font-semibold text-white bg-custom-main hover:bg-custom-secondary rounded-lg transition"
              >
                👋 Farewell
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default UserSettings;
