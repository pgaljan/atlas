import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { resetPassword } from "../../../redux/slices/users";
import cogoToast from "@successtar/cogo-toast";

const ResetPassword = () => {
  const dispatch = useDispatch();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirm) return setError("Both fields are required");
    if (password !== confirm) return setError("Passwords do not match");

    setError("");

    try {
      await dispatch(
        resetPassword({ token, email, newPassword: password })
      ).unwrap();
      cogoToast.success("Password has been reset successfully");
      setSuccess(true);
    } catch (err) {
      cogoToast.error(err?.message || "Reset failed");
    }
  };

  return (
    <div className="bg-custom-background-white h-screen flex justify-center items-center">
      <div className="p-6 w-full max-w-md">
        <h1 className="text-3xl font-semibold text-center mb-4 text-custom-text-heading">
          Reset Password
        </h1>

        {success ? (
          <div className="text-green-600 text-center">
            Password has been reset.{" "}
            <Link to="/" className="underline text-blue-600">
              Login now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label className="block text-sm font-medium text-custom-text-grey mb-1">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-custom-text-grey mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-custom-main text-white py-2 cursor-pointer rounded-lg mt-2 hover:bg-custom-main transition duration-200 ease-in-out"
            >
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
