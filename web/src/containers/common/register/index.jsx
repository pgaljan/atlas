import cogoToast from "@successtar/cogo-toast";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import OnboardingHeader from "../../../components/common/OnboardingHeader";
import Icons from "../../../constants/icons";
import { fetchAppSettings } from "../../../redux/slices/app-settings";
import { registerUser } from "../../../redux/slices/auth";

const OAuthLoginButton = ({ provider, icon: Icon, label }) => {
  const handleOAuthLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/${provider}`;
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
  const code = searchParams.get("code");
  const emailFromParams = searchParams.get("email");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState(code || "");
  const [inviteCodeOption, setInviteCodeOption] = useState("disabled");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadInviteSetting = async () => {
      try {
        const result = await dispatch(fetchAppSettings());
        if (fetchAppSettings.fulfilled.match(result)) {
          const settings = result.payload;
          if (settings?.inviteCodeOption) {
            setInviteCodeOption(settings.inviteCodeOption);
          }
        }
      } catch (err) {
        console.error("Failed to fetch app settings", err);
      }
    };
    loadInviteSetting();

    if (emailFromParams && !email) {
      setEmail(emailFromParams);
    }
  }, [dispatch, emailFromParams, email]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password || !displayName) {
      cogoToast.error("All fields are required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      cogoToast.error("Please enter a valid email");
      return;
    }

    if (inviteCodeOption === "required" && !inviteCode) {
      cogoToast.error("Invite code is required");
      return;
    }

    const registrationData = {
      displayName,
      email,
      password,
      referralCode: inviteCode,
    };

    setIsSubmitting(true);

    dispatch(registerUser(registrationData))
      .unwrap()
      .then((response) => {
        cogoToast.success("Registration successful!");
        navigate(`/subscription-plans?userId=${response?.id}`);
      })
      .catch((err) => {
        if (err?.message === "User with this email already exists") {
          cogoToast.error("This email is already registered.");
        } else if (err?.message?.includes("Display name must be unique")) {
          cogoToast.error("Display name is already taken.");
        } else if (err?.message?.includes("Invalid or expired invite code")) {
          cogoToast.error("Invalid invite code.");
        } else {
          cogoToast.error(err.message || "Registration failed.");
        }
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="bg-custom-background-white">
      <OnboardingHeader />
      <main className="flex items-center justify-center h-screen">
        <div className="p-6 w-full max-w-[30%]">
          <h1 className="text-3xl font-semibold text-center mb-4 text-custom-text-heading">
            Register
          </h1>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label className="block text-sm font-medium text-custom-text-grey mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                className="w-full p-2 border-2 rounded-md focus:border-custom-main focus:outline-none"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-custom-text-grey mb-1">
                Work Email
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
              <label className="block text-sm font-medium text-custom-text-grey mb-1">
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

            {/* Invite Code (conditionally rendered) */}
            {inviteCodeOption !== "disabled" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-custom-text-grey mb-1">
                  Invite Code{" "}
                  {inviteCodeOption === "required" && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Enter invite code"
                  className="w-full p-2 border-2 rounded-md focus:border-custom-main focus:outline-none"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-custom-main text-white py-2 rounded-lg mt-2 hover:bg-custom-main transition duration-200 ease-in-out"
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

          <div className="text-center mt-4 text-sm">
            By registering, you agree to our{" "}
            <Link
              to="/terms-of-service"
              className="text-black underline hover:text-blue-700 transition"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy-policy"
              className="text-black underline hover:text-blue-700 transition"
            >
              Privacy Policy
            </Link>
            .
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
