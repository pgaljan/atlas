import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const OnboardingHeader = () => {
  const appName =
    useSelector((state) => state.appSettings.appSettings?.appName) || "Atlas";

  return (
    <header className="p-4 bg-custom-navbar flex items-center justify-between sticky top-0 z-50
">
      <Link to="/" className="text-white text-xl font-semibold capitalize ">
        {appName}
      </Link>
      <Link
        to="/register"
        className="border border-white text-white px-4 py-1.5 rounded-lg text-sm"
      >
        Sign up for free
      </Link>
    </header>
  );
};

export default OnboardingHeader;
