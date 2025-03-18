import cogoToast from "@successtar/cogo-toast";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
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

    setTimeout(() => {
      cogoToast.success("Admin login successful!");
      setIsSubmitting(false);
    }, 1000);
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
                id="admin-email"
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
                id="admin-password"
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
