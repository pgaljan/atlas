import cogoToast from "@successtar/cogo-toast";
import React, { useState } from "react";

const ShareModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [customMessage, setCustomMessage] = useState("");

  // Regex for validating email
  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  // Add email to the selected list
  const handleAddEmail = (e) => {
    if (e.key === "Enter" && isValidEmail(email)) {
      setSelectedEmails((prev) => [...prev, email.trim()]);
      setEmail("");
    }
  };

  // Remove email from the selected list
  const handleRemoveEmail = (emailToRemove) => {
    setSelectedEmails((prev) =>
      prev.filter((selectedEmail) => selectedEmail !== emailToRemove)
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-11/12 max-w-lg">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-bold">Share Markmap</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ✖
          </button>
        </div>

        {/* Email input */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Invite by email
          </label>
          <div className="flex items-center mt-2 space-x-2">
            <input
              type="text"
              placeholder="Add people by email and press Enter"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleAddEmail}
              className="flex-grow border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none  focus:border-custom-main"
            />
            <select className="border-2 border-gray-300 rounded-md px-2 py-2 focus:outline-none  focus:border-custom-main">
              <option value="edit">Can edit</option>
              <option value="view">Can view</option>
            </select>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Press <b>Enter</b> to add an email.
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

        {/* Conditional Rendering */}
        {selectedEmails.length > 0 ? (
          // Custom Message Section (Visible when emails are added)
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Add a custom message (optional)
            </label>
            <textarea
              rows={3}
              placeholder="Add an optional message for invitees..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
        ) : (
          // Link Settings Section (Visible when no emails are added)
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Link settings
            </label>
            <div className="flex items-center bg-gray-100 rounded-md p-3 mt-2">
              <span className="flex-grow text-gray-700">
                The link allows <b>anyone in your team</b> to edit, but it
                cannot be accessed by people outside your team.
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex justify-between items-center">
          <button
            className={`text-white px-4 py-2 rounded-md ${
              selectedEmails.length > 0
                ? "bg-custom-main hover:bg-red-800"
                : "bg-custom-main hover:bg-red-800"
            }`}
            onClick={() => {
              if (selectedEmails.length > 0) {
                cogoToast.success(
                  `Invites sent to: ${selectedEmails.join(
                    ", "
                  )}\nMessage: ${customMessage}`
                );
                setSelectedEmails([]);
                setCustomMessage("");
              } else {
                navigator.clipboard.writeText("Copied link!");
                cogoToast.success("Link copied to clipboard!");
              }
            }}
          >
            {selectedEmails.length > 0 ? "Send Invites" : "Copy Link"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
