import cogoToast from "@successtar/cogo-toast";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { createInvitation } from "../../redux/slices/invitations";
import { fetchUser } from "../../redux/slices/users";

const InviteModal = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const workspaceId = Cookies.get("workspaceId");
  const dispatch = useDispatch();
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [customMessage, setCustomMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [userData, setUserData] = useState(null);
  const [emailError, setEmailError] = useState("");

  const userId = Cookies.get("atlas_userId");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await dispatch(fetchUser(userId)).unwrap();
        setUserData(data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUserData();
  }, [dispatch, userId]);

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleAddEmail = (e, triggeredByBlur = false) => {
    if (!triggeredByBlur && e.key !== "Enter") return;

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      if (!triggeredByBlur) {
        setEmailError("Please enter an email.");
      }
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setEmailError("That doesn’t look like a valid email.");
      return;
    }

    if (selectedEmails.includes(trimmedEmail)) {
      setEmailError("This email has already been added.");
      return;
    }

    if (userData?.inviteCount <= selectedEmails.length) {
      setEmailError("You’ve used all your invites. Contact admin for more.");
      return;
    }

    setSelectedEmails((prev) => [...prev, trimmedEmail]);
    setEmail("");
    setEmailError("");
  };

  const handleRemoveEmail = (emailToRemove) => {
    setSelectedEmails((prev) =>
      prev.filter((selectedEmail) => selectedEmail !== emailToRemove)
    );
  };

  const handleSendInvites = async () => {
    if (!workspaceId) {
      cogoToast.error("Workspace ID is missing.");
      return;
    }
    if (selectedEmails.length === 0) {
      cogoToast.error("Please add at least one email.");
      return;
    }

    setIsSending(true);
    try {
      await Promise.all(
        selectedEmails.map((email) =>
          dispatch(
            createInvitation({ workspaceId, email, customMessage })
          ).unwrap()
        )
      );
      cogoToast.success("Invitations sent successfully!");
      setSelectedEmails([]);
      setCustomMessage("");
    } catch (error) {
      cogoToast.error(`Failed to send invitations: ${error?.message || error}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center !ml-0">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-auto shadow-lg">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-bold">Invite Your Teammates to Atlas</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ✖
          </button>
        </div>

        {/* Email Input */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Invite by Email
          </label>
          <div className="flex items-center mt-2 space-x-2">
            <input
              type="text"
              placeholder="Enter a teammate's email and press Enter"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              onKeyDown={handleAddEmail}
              onBlur={() => handleAddEmail(null, true)}
              className="flex-grow border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-custom-main"
            />
            <button
              type="button"
              onClick={() => handleAddEmail({ key: "Enter" })}
              className="bg-custom-main text-white px-4 py-2 rounded-md hover:bg-custom-main-dark transition duration-200 ease-in-out"
            >
              Enter
            </button>
          </div>

          {emailError && <p className="text-red-500 text-sm">{emailError}</p>}

          <p className="text-sm text-gray-500 mt-2">
            Press <b>Enter</b> to add an email address.
          </p>
        </div>

        {/* Selected Emails */}
        <div className="mt-2">
          {selectedEmails.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedEmails.map((email, index) => (
                <div
                  key={index}
                  className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                >
                  <span>{email}</span>
                  <button
                    onClick={() => handleRemoveEmail(email)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ✖
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Personalization Section */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Personalize Your Invitation (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="Write a brief message to invite your teammate..."
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-custom-main"
          ></textarea>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex justify-between items-center">
          <button
            className={`text-white px-4 py-2 rounded-md ${
              selectedEmails.length > 0
                ? "bg-custom-main hover:bg-red-800"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            onClick={handleSendInvites}
            disabled={isSending || selectedEmails.length === 0}
          >
            {isSending ? "Sending Invitations..." : "Send Invitations"}
          </button>
          <div className="flex items-center space-x-2 bg-gradient-to-r from-red-900 to-red-600 text-white py-1 px-4 rounded-full">
            <span className="font-medium">
              {userData?.inviteCount} Invites Left!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
