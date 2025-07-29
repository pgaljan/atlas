import { useState } from "react";
import { FiCopy, FiKey, FiLink, FiRefreshCw, FiSettings } from "react-icons/fi";
import APIManagementLayout from "../../../components/api-management/APIManagementLayout";

const DeveloperSettingsPage = () => {
  const [apiKey] = useState("sk_live_4e7cf98357b8...");
  const [webhookURL, setWebhookURL] = useState(
    "https://yourdomain.com/webhooks"
  );
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <APIManagementLayout>
      <div className="px-6 py-6 space-y-10">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-1">
            Developer <span className="text-custom-main">Settings</span>
          </h1>
          <p className="text-sm text-gray-500">
            Manage your API keys, webhook URLs, and advanced developer options.
          </p>
        </div>

        {/* API Key Section */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <FiKey /> API Key
          </div>

          <div className="relative">
            <code className="block bg-gray-50 p-3 rounded-md border border-gray-100 text-sm font-mono text-gray-800 pr-12 truncate">
              {apiKey}
            </code>

            <button
              onClick={handleCopy}
              className="absolute top-2 right-10 p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              title="Copy API Key"
            >
              <FiCopy size={16} />
            </button>

            <button
              className="absolute top-2 right-2 p-1.5 rounded-md text-gray-400 hover:text-orange-500 hover:bg-orange-100 transition"
              title="Regenerate API Key"
              onClick={() => alert("API Key regenerated (mock).")}
            >
              <FiRefreshCw size={16} />
            </button>
          </div>

          {copied && (
            <p className="text-xs text-green-600 font-medium">
              API Key copied!
            </p>
          )}
        </section>

        {/* Webhook URL Section */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <FiLink /> Webhook URL
          </div>

          <input
            value={webhookURL}
            onChange={(e) => setWebhookURL(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-custom-main focus:outline-none"
            placeholder="https://yourdomain.com/webhooks"
          />

          <button
            onClick={() => alert("Webhook URL updated (mock).")}
            className="text-sm bg-custom-main text-white px-4 py-2 rounded-md hover:bg-custom-main/90 w-fit"
          >
            Save Webhook URL
          </button>
        </section>

        {/* Advanced Settings */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <FiSettings /> Advanced Developer Options
          </div>

          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>Enable webhook signature verification</li>
            <li>Auto-retry on webhook failures</li>
            <li>Log full API request/response payloads</li>
          </ul>
        </section>
      </div>
    </APIManagementLayout>
  );
};

export default DeveloperSettingsPage;
