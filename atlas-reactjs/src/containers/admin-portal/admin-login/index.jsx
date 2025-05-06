import cogoToast from "@successtar/cogo-toast";
import Cookies from "js-cookie";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../../redux/slices/auth";

const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!email) {
      setEmailError("Email is required");
      return;
    }
    if (!password) {
      setPasswordError("Password is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email");
      return;
    }
    setEmailError("");
    setPasswordError("");
    setIsSubmitting(true);

    try {
      const response = await dispatch(loginUser({ email, password })).unwrap();
      if (!response.user.isAdmin) {
        Cookies.remove("atlas_admin_token");
        cogoToast.error("You are not authorized to access the admin area");
        setIsSubmitting(false);
        return;
      }

      // Store the token in a cookie
      Cookies.set("atlas_admin_token", response.access_token);
      Cookies.set("atlas_admin_email", response.user.email, { expires: 1 });
      Cookies.set("atlas_admin_username", response.user.username, { expires: 1 });
      Cookies.set("atlas_admin_userId", response.user.id, { expires: 1 });

      cogoToast.success("Admin login successful!");
      navigate("/app/admin-portal/user-management");
    } catch (error) {
      console.error("Login error:", error);
      cogoToast.error(error.message || "Admin login failed!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-custom-background-white min-h-screen flex flex-col">
      <header className="p-4 bg-custom-navbar flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/"
            className="flex items-center space-x-2 text-xl text-white"
          >
            <span className="font-semibold">Atlas Admin</span>
          </Link>
        </div>
        <Link
          to="/"
          className="border border-white transition duration-200 ease-in-out text-white px-4 py-1.5 rounded-lg text-sm"
        >
          Back to Site
        </Link>
      </header>

      <main className="flex items-center justify-center flex-grow">
        <div className="p-6 w-full max-w-md">
          <h1 className="text-3xl font-semibold text-center mb-6 text-custom-text-heading">
            Admin Login
          </h1>
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label
                htmlFor="admin-email"
                className="block text-sm font-medium text-custom-text-grey mb-1"
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-2 border-2 rounded-md focus:border-custom-main focus:outline-none"
              />
              {emailError && (
                <p className="text-red-500 text-xs mt-1">{emailError}</p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="admin-password"
                className="block text-sm font-medium text-custom-text-grey mb-1"
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full p-2 border-2 rounded-md focus:border-custom-main focus:outline-none"
              />
              {passwordError && (
                <p className="text-red-500 text-xs mt-1">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-custom-main text-white py-2 rounded-lg mt-2 hover:bg-custom-main transition duration-200 ease-in-out"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AdminLogin;
