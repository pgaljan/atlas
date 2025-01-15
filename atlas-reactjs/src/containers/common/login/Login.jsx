import cogoToast from "@successtar/cogo-toast";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { loginUser } from "../../../redux/slices/auth";
import Icons from "../../../constants/icons";

const GoogleLoginButton = () => (
  <button className="w-full text-black py-2 px-4 border rounded-lg flex items-center justify-center space-x-2 text-sm hover:bg-custom-tab-active transition duration-200 ease-in-out">
    <Icons.GoogleIcon />
    <span>Log in with Google</span>
  </button>
);

const Login = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
    setIsSubmitting(true);

    // Dispatch the login action
    dispatch(loginUser({ email, password }))
      .unwrap()
      .then((response) => {
        // Store token and user details in cookies
        Cookies.set("atlas_access_token", response.access_token, {
          expires: 1,
        });
        Cookies.set("atlas_email", response.user.email, { expires: 1 });
        Cookies.set("atlas_username", response.user.username, { expires: 1 });
        Cookies.set("atlas_userId", response.user.id, { expires: 1 });

        cogoToast.success("Login successful!");
        navigate("/app/dashboard");
        setIsSubmitting(false);
      })
      .catch((err) => {
        if (err && err.message && err.message === "User not found") {
          cogoToast.error("No account found with this email.");
        } else {
          cogoToast.error(err.message || "Login failed!");
        }
        setIsSubmitting(false);
      });
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
          Sign up for free
        </Link>
      </header>

      <main className="flex items-center justify-center h-screen">
        <div className="p-6 w-full max-w-[30%]">
          <h1 className="text-3xl font-semibold text-center mb-4 text-custom-text-heading">
            Login
          </h1>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label
                htmlFor="work-email-input"
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
              {emailError && (
                <p className="text-red-500 text-xs mt-1">{emailError}</p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="password-input"
                className="block text-sm font-medium text-custom-text-grey mb-1"
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              {passwordError && (
                <p className="text-red-500 text-xs mt-1">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-custom-main text-white py-2 cursor-pointer rounded-lg mt-2 hover:bg-custom-main transition duration-200 ease-in-out"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Loading..." : "Continue"}
            </button>
          </form>

          <div className="my-4 text-center">
            <p className="text-sm text-custom-text-grey">Or</p>
          </div>

          <GoogleLoginButton />

          <p className="text-sm text-custom-text-grey text-center mt-4">
            If the Google button doesn't work, try entering your work email
            above to be redirected to your organization's SSO (single sign-on)
            login page.
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

export default Login;
