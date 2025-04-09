import cogoToast from "@successtar/cogo-toast";
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { registerUser } from "../../../redux/slices/auth";
import Icons from "../../../constants/icons";

const OAuthLoginButton = ({ provider, icon: Icon, label }) => {
  const handleOAuthLogin = async () => {
    try {
      window.location.href = `${import.meta.env.VITE_API_URL}/auth/${provider}`;
    } catch (error) {
      cogoToast.error(error.message || `${label} login failed!`);
    }
  };

  return (
    <button
      onClick={handleOAuthLogin}
      className="w-full text-black py-2 px-4 border rounded-lg flex items-center justify-center space-x-2 text-sm hover:bg-custom-tab-active transition duration-200 ease-in-out"
    >
      <Icon />
      <span>Sign Up with {label}</span>
    </button>
  );
};

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");
  const code = searchParams.get("code");

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      cogoToast.error("All fields are required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      cogoToast.error("Please enter a valid email");
      return;
    }

    setIsSubmitting(true);

    const registrationData = {
      fullName,
      email,
      password,
      ...(token && code ? { referralCode: code } : {}),
    };

    dispatch(registerUser(registrationData))
      .unwrap()
      .then((response) => {
        cogoToast.success("Registration successful!");

        const userId = response?.id;
        navigate(`/subscription-plans?userId=${userId}`);

        // Reset form values
        setEmail("");
        setPassword("");
        setFullName("");
      })
      .catch((err) => {
        if (
          err &&
          err.message &&
          err.message === "User with this email already exists"
        ) {
          cogoToast.error(
            "This email is already registered. Please try another one."
          );
        } else {
          cogoToast.error(err.message || "Registration failed");
        }
      })
      .finally(() => {
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
          to="/"
          className="border border-white text-white px-4 py-1.5 rounded-lg text-sm"
        >
          Already have an account? Log in
        </Link>
      </header>

      <main className="flex items-center justify-center h-screen">
        <div className="p-6 w-full max-w-[30%]">
          <h1 className="text-3xl font-semibold text-center mb-4 text-custom-text-heading">
            Register
          </h1>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label
                htmlFor="full-name-input"
                className="block text-sm font-medium text-custom-text-grey mb-1"
              >
                Full Name
              </label>
              <input
                type="text"
                id="full-name-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full p-2 border-2 rounded-md focus:border-custom-main focus:outline-none"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="work-email-input"
                className="block text-sm font-medium text-custom-text-grey mb-1"
              >
                Work Email
              </label>
              <input
                type="email"
                id="work-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your work email"
                className="w-full p-2 border-2 rounded-md focus:border-custom-main focus:outline-none"
              />
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
                id="password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full p-2 border-2 rounded-md focus:border-custom-main focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-custom-main text-white py-2 cursor-pointer rounded-lg mt-2 hover:bg-custom-main transition duration-200 ease-in-out"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Loading..." : "Sign Up"}
            </button>
          </form>

          <div className="my-4 text-center">
            <p className="text-sm text-custom-text-grey">Or</p>
          </div>

          <div className="flex flex-col gap-2">
            <OAuthLoginButton
              provider="google"
              icon={Icons.GoogleIcon}
              label="Google"
            />
            <OAuthLoginButton
              provider="github"
              icon={Icons.GithubIcon}
              label="GitHub"
            />
          </div>

          <p className="text-sm text-custom-text-grey text-center mt-4">
            If the Google button doesn't work, you can fill in the form above to
            register your account.
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

export default Register;
