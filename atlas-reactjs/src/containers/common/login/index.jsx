import cogoToast from "@successtar/cogo-toast";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Icons from "../../../constants/icons";
import { fetchAppSettings } from "../../../redux/slices/app-settings";
import { loginUser } from "../../../redux/slices/auth";
import PrivacyPolicy from "../privacy-policy/index"
import OnboardingHeader from "../../../components/common/OnboardingHeader";

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
      <span>Log in with {label}</span>
    </button>
  );
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authProviders, setAuthProviders] = useState({
    local: true,
    google: true,
    github: true,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const loadAuthSettings = async () => {
      try {
        const result = await dispatch(fetchAppSettings());
        if (fetchAppSettings.fulfilled.match(result)) {
          const settings = result.payload;
          if (settings?.authProviders) {
            setAuthProviders(settings.authProviders);
          }
        }
      } catch (error) {
        console.error("Failed to fetch auth settings", error);
      }
    };

    loadAuthSettings();
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return setEmailError("Email is required");
    if (!/\S+@\S+\.\S+/.test(email)) return setEmailError("Enter valid email");
    if (!password) return setPasswordError("Password is required");

    setEmailError("");
    setPasswordError("");
    setIsSubmitting(true);

    dispatch(loginUser({ email, password }))
      .unwrap()
      .then((response) => {
        Cookies.set("atlas_access_token", response.access_token, {
          expires: 1,
        });
        Cookies.set("atlas_email", response.user.email, { expires: 1 });
        Cookies.set("atlas_username", response.user.username, { expires: 1 });
        Cookies.set("atlas_userId", response.user.id, { expires: 1 });
        Cookies.set("workspaceId", response.user.workspaceId, { expires: 1 });
        Cookies.set("displayName", response.user.displayName, { expires: 1 });
        cogoToast.success("Login successful!");
        navigate("/app/dashboard");
      })
      .catch((err) => {
        cogoToast.error(err.message || "Login failed!");
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="bg-custom-background-white">
      <OnboardingHeader/>

      <main className="flex items-center justify-center h-screen">
        <div className="p-6 w-full max-w-[30%]">
          <h1 className="text-3xl font-semibold text-center mb-4 text-custom-text-heading">
            Login
          </h1>

          {/* 🟢 LOCAL LOGIN FORM (conditionally rendered) */}
          {authProviders.local && (
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-4">
                <label className="block text-sm font-medium text-custom-text-grey mb-1">
                  Work email
                </label>
                <input
                  type="email"
                  value={email}
                  placeholder="Enter your email"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border-2 rounded-md focus:border-custom-main focus:outline-none"
                />
                {emailError && (
                  <p className="text-red-500 text-xs mt-1">{emailError}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-custom-text-grey mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border-2 rounded-md focus:border-custom-main focus:outline-none"
                />
                {passwordError && (
                  <p className="text-red-500 text-xs mt-1">{passwordError}</p>
                )}

                {/* 🔹 Reset password link */}
                <div className="text-right mt-1">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-custom-main text-white py-2 rounded-lg mt-2 hover:bg-custom-main transition duration-200 ease-in-out"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Loading..." : "Continue"}
              </button>

              <div className="my-4 text-center">
                <p className="text-sm text-custom-text-grey">Or</p>
              </div>
            </form>
          )}

          {/* 🟢 OAUTH BUTTONS */}
          <div className="flex flex-col gap-2">
            {authProviders.google && (
              <OAuthLoginButton
                provider="google"
                icon={Icons.GoogleIcon}
                label="Google"
              />
            )}
            {authProviders.github && (
              <OAuthLoginButton
                provider="github"
                icon={Icons.GithubIcon}
                label="GitHub"
              />
            )}
          </div>

          <p className="text-sm text-custom-text-grey text-center mt-4">
            If the Google button doesn't work, try entering your work email
            above to be redirected to your organization's SSO.
          </p>

          <div className="text-center mt-4 text-sm">
            <Link
              to="/terms-of-service"
              className="text-black underline hover:text-blue-700"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy-policy"
              className="text-black underline hover:text-blue-700"
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

export default Login;
