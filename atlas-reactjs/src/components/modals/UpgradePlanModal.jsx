import { HiOutlineArrowLeft, HiOutlineRocketLaunch } from "react-icons/hi2";
import { MdWorkspacePremium } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const UpgradePlanModal = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-[4px] flex items-center justify-center">
      {/* Gradient Blend Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-custom-main/40 to-black/60 mix-blend-overlay pointer-events-none" />

      {/* Modal Content */}
      <div className="relative z-10 max-w-xl w-[92%] md:w-[480px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-white/20 dark:border-gray-700 rounded-3xl px-8 py-10 shadow-[0_10px_40px_rgba(0,0,0,0.3)] animate-fade-in scale-95 animate-in">
        {/* Icon w/ glow */}
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full bg-custom-main/30 blur-xl animate-pulse" />
          <MdWorkspacePremium className="relative z-10 text-custom-main text-5xl" />
        </div>

        {/* Heading */}
        <h2 className="text-2xl md:text-3xl text-center font-extrabold text-custom-main mb-2">
          Upgrade Required
        </h2>

        {/* Description */}
        <p className="text-sm md:text-base text-center text-gray-700 dark:text-gray-300 leading-relaxed">
          Your current plan does not support API access. Upgrade to unlock
          developer tools, webhooks, API keys, and more advanced features.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col md:flex-row justify-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center border-custom-main gap-2 px-5 py-3 text-sm font-medium rounded-xl border text-custom-main hover:bg-gray-100 transition "
          >
            <HiOutlineArrowLeft className="text-lg" />
            Go Back
          </button>
          <button
            onClick={() => navigate("/app/upgrade-plans")}
            className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl bg-gradient-to-br from-custom-main to-blue-600 text-white hover:brightness-110 hover:scale-[1.02] transition"
          >
            <HiOutlineRocketLaunch className="text-lg" />
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradePlanModal;
