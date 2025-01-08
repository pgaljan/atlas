import React, { useState } from "react";
import { Link } from "react-router-dom";

const GoogleLoginButton = () => (
  <button className="w-full text-black py-2 px-4 border rounded-lg flex items-center justify-center space-x-2 text-sm hover:bg-custom-tab-active transition duration-200 ease-in-out">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width="24"
      height="24"
      id="google"
    >
      <path
        fill="#fbbb00"
        d="M113.47 309.408 95.648 375.94l-65.139 1.378C11.042 341.211 0 299.9 0 256c0-42.451 10.324-82.483 28.624-117.732h.014L86.63 148.9l25.404 57.644c-5.317 15.501-8.215 32.141-8.215 49.456.002 18.792 3.406 36.797 9.651 53.408z"
      ></path>
      <path
        fill="#518ef8"
        d="M507.527 208.176C510.467 223.662 512 239.655 512 256c0 18.328-1.927 36.206-5.598 53.451-12.462 58.683-45.025 109.925-90.134 146.187l-.014-.014-73.044-3.727-10.338-64.535c29.932-17.554 53.324-45.025 65.646-77.911h-136.89V208.176h245.899z"
      ></path>
      <path
        fill="#28b446"
        d="m416.253 455.624.014.014C372.396 490.901 316.666 512 256 512c-97.491 0-182.252-54.491-225.491-134.681l82.961-67.91c21.619 57.698 77.278 98.771 142.53 98.771 28.047 0 54.323-7.582 76.87-20.818l83.383 68.262z"
      ></path>
      <path
        fill="#f14336"
        d="m419.404 58.936-82.933 67.896C313.136 112.246 285.552 103.82 256 103.82c-66.729 0-123.429 42.957-143.965 102.724l-83.397-68.276h-.014C71.23 56.123 157.06 0 256 0c62.115 0 119.068 22.126 163.404 58.936z"
      ></path>
    </svg>
    <span>Reset with Google</span>
  </button>
);

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setError("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email");
      return;
    }
    setError("");
    setIsSubmitting(true);

    // Simulate an API call
    setTimeout(() => {
      setIsSubmitting(false);
      console.log("Password reset link sent");
    }, 2000);
  };

  return (
    <div className="bg-custom-background-white">
      <header className="p-4 bg-custom-navbar flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/"
            className="flex items-center space-x-2 text-xl text-white"
          >
            <span className="font-semibold">Atlas</span>
          </Link>
        </div>
        <Link
          to="/register"
          className="border border-white  transition duration-200 ease-in-out text-white px-4 py-1.5 rounded-lg text-sm"
        >
          Don't have an account? Sign Up
        </Link>
      </header>

      <main className="flex items-center justify-center h-screen">
        <div className="p-6 w-full max-w-[30%]">
          <h1 className="text-3xl font-semibold text-center mb-4 text-custom-text-heading">
            Reset Password
          </h1>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label
                htmlFor="reset-email-input"
                className="block text-sm font-medium text-custom-text-grey mb-1"
              >
                Work email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your work email"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

            <button
              type="submit"
              className="w-full bg-custom-main text-white py-2 cursor-pointer rounded-lg mt-2 hover:bg-custom-main transition duration-200 ease-in-out"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div className="my-4 text-center">
            <p className="text-sm text-custom-text-grey">Or</p>
          </div>

          <GoogleLoginButton />

          <p className="text-sm text-custom-text-grey text-center mt-4">
            If the Google button doesn't work, enter your email to receive a
            password reset link.
          </p>

          <div className="text-center mt-4">
            <Link
              to="http://www.Atlas.co/terms/services-agreement"
              className="text-black underline text-sm hover:text-blue-700 transition duration-200 ease-in-out"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;
