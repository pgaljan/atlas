import React from "react";
import APIManagementLayout from "../../../components/api-management/APIManagementLayout";
import { FiBookOpen, FiHelpCircle, FiMail } from "react-icons/fi";

const supportLinks = [
  {
    title: "Getting Started Guide",
    description: "Learn how to start using the Atlas API Management platform.",
    href: "/docs/getting-started",
    icon: <FiBookOpen size={18} />,
  },
  {
    title: "Authentication",
    description: "Understand how to use API keys and secure your endpoints.",
    href: "/docs/authentication",
    icon: <FiBookOpen size={18} />,
  },
  {
    title: "API Reference",
    description: "Explore all available endpoints with usage examples.",
    href: "/docs/api-reference",
    icon: <FiBookOpen size={18} />,
  },
  {
    title: "FAQs",
    description: "Find answers to the most common questions.",
    href: "/docs/faq",
    icon: <FiHelpCircle size={18} />,
  },
];

const index = () => {
  return (
    <APIManagementLayout>
      <div className="px-6 py-6 space-y-10">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-1">
            Documentation & <span className="text-custom-main">Support</span>
          </h1>
          <p className="text-sm text-gray-500">
            Access technical documentation or reach out for help and assistance.
          </p>
        </div>

        {/* Docs Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {supportLinks.map((link, idx) => (
            <a
              href={link.href}
              key={idx}
              className="flex flex-col p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition hover:border-custom-main"
            >
              <div className="mb-3 text-custom-main">{link.icon}</div>
              <h3 className="font-semibold text-gray-900 text-base mb-1">
                {link.title}
              </h3>
              <p className="text-sm text-gray-500 leading-snug">
                {link.description}
              </p>
            </a>
          ))}
        </section>

        {/* Contact Support */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Still Need Help?
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            If you can’t find your answer in the docs or have a specific issue,
            reach out to our support team directly.
          </p>
          <a
            href="mailto:support@atlas.dev"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-custom-main text-white rounded-md hover:bg-custom-main/90 transition"
          >
            <FiMail size={16} />
            Contact Support
          </a>
        </section>
      </div>
    </APIManagementLayout>
  );
};

export default index;
