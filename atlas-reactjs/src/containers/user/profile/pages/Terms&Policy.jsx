import React from "react";
import { FaCookieBite, FaRegFileAlt } from "react-icons/fa";
import { MdPrivacyTip } from "react-icons/md";

const TermsAndPolicies = () => {
  return (
    <div className="w-full max-w-screen-lg ">
      <h1 className="text-lg font-semibold text-custom-text-heading ">
        Terms & Policies
      </h1>
      <p className="text-custom-text-grey mb-4 mt-2">
        Below, you'll find information on our Terms of Service and our Privacy
        Policy.
      </p>

      <div className="flex items-center gap-2 mb-6">
        <span className="text-custom-main text-base">✔</span>
        <p className="text-custom-text-grey">
          You accepted the Terms of Service on{" "}
          <strong>December 31, 2024 06:48 (GMT).</strong>
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <span className="text-custom-text-heading text-2xl">
            <MdPrivacyTip />
          </span>
          <div>
            <h2 className="text-custom-text-heading font-medium mb-1">
              Privacy Policy
            </h2>
            <p className="text-custom-text-grey text-sm">
              At Meister, we believe you should always know what data we collect
              from you and how we use it, and that you should have meaningful
              control over both. Our Privacy Policy provides information on the
              processing of personal data by Meister obtained in connection with
              a visit to our websites, use of our community platform or use of
              our web-services and mobile applications. Whenever significant
              changes are made to the Privacy Policy, we will post a notice on
              our websites for a period of 30 days.
              <a href="#" className="text-blue-600 underline ml-1">
                Read in full
              </a>
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <span className="text-custom-text-heading text-2xl">
            <FaRegFileAlt />
          </span>
          <div>
            <h2 className="text-custom-text-heading font-medium mb-1">
              Terms of Service
            </h2>
            <p className="text-custom-text-grey text-sm">
              When you signed up for our product(s) you agreed to our Terms of
              Service. These act as a contract between MeisterLabs and you,
              dictating what you are allowed to do with our services, and
              consequently what our liability is to you.
              <a href="#" className="text-blue-600 underline ml-1">
                Read in full
              </a>
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <span className="text-custom-text-heading font-bold text-2xl">
            <FaCookieBite />{" "}
          </span>
          <div>
            <h2 className="text-custom-text-heading font-medium mb-1">
              Cookie Consent
            </h2>
            <p className="text-custom-text-grey text-sm">
              When you visit our websites and tools, we can access or save
              information via your browser using cookies and similar
              technologies. They allow for targeted information and an analysis
              of pageviews for our website. This helps us to improve the quality
              of our services and provide you with a personalized online
              experience.
            </p>
            <div className="mt-2 space-x-4">
              <label className="flex items-center gap-2 text-custom-text-grey">
                <input type="checkbox" className="form-checkbox" /> Necessary
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2 text-custom-text-grey">
                <input type="checkbox" className="form-checkbox" />
                {""}
                Marketing and Analytics
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        <button className="bg-custom-main text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition">
          Save changes
        </button>
      </div>
    </div>
  );
};

export default TermsAndPolicies;
