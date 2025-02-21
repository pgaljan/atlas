import cogoToast from "@successtar/cogo-toast";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../../redux/slices/auth";
import Icons from "../../../constants/icons";

const GoogleLoginButton = () => (
  <button className="w-full text-black py-2 px-4 border rounded-lg flex items-center justify-center space-x-2 text-sm hover:bg-custom-tab-active transition duration-200 ease-in-out">
    <Icons.GoogleIcon />
    <span>Sign up with Google</span>
  </button>
);

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
  
    dispatch(registerUser({ fullName, email, password }))
      .unwrap()
      .then((response) => {
        cogoToast.success("Registration successful!");
  
        // Extract user ID from response
        const userId = response?.id;
        // Redirect to subscription plans with user ID (if needed)
        navigate(`/subscription-plans?userId=${userId}`);
  
        // Reset form
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
                htmlFor="confirm-password-input"
                className="block text-sm font-medium text-custom-text-grey mb-1"
              >
                Full Name
              </label>
              <input
                type="text"
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
                Work email
              </label>
              <input
                type="email"
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

         <GoogleLoginButton />

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
