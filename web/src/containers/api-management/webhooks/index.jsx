import { FiCode, FiCopy, FiLink2, FiZap } from "react-icons/fi";
import APIManagementLayout from "../../../components/api-management/APIManagementLayout";

const webhookPayload = {
  event: "user.created",
  timestamp: "2025-07-14T12:34:56Z",
  data: {
    id: "user_123456",
    name: "Jane Doe",
    email: "jane@example.com",
  },
};

const index = () => {
  const webhookURL = "https://yourdomain.com/webhooks";

  return (
    <APIManagementLayout>
      <div className="px-6 py-6 space-y-10">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-1">
            Webhooks <span className="text-custom-main">Integration</span>
          </h1>
          <p className="text-sm text-gray-500">
            Automatically receive real-time updates when certain events occur.
          </p>
        </div>

        {/* What are Webhooks */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FiZap /> What Are Webhooks?
          </h2>
          <p className="text-sm text-gray-600">
            Webhooks allow you to receive HTTP callbacks when specific events
            happen in your API environment — such as a user creation, payment
            success, or error.
          </p>
        </section>

        {/* Setup Instructions */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FiLink2 /> Setup Guide
          </h2>

          <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2">
            <li>
              Go to your{" "}
              <span className="text-custom-main font-medium">
                Developer Settings
              </span>{" "}
              and add a webhook URL.
            </li>
            <li>
              Choose the events you want to subscribe to (e.g.,{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">
                user.created
              </code>
              ,{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">
                payment.success
              </code>
              ).
            </li>
            <li>
              We will send a POST request to your endpoint with event data in
              JSON format.
            </li>
            <li>
              Verify the webhook signature (optional) to ensure authenticity.
            </li>
          </ol>
        </section>

        {/* Your Webhook URL */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-2">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FiCode /> Your Webhook URL
          </h2>
          <div className="relative">
            <code className="block bg-gray-50 p-3 rounded-md border border-gray-100 text-sm font-mono text-gray-800">
              {webhookURL}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(webhookURL)}
              className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition"
              title="Copy URL"
            >
              <FiCopy size={16} />
            </button>
          </div>
        </section>

        {/* Example Payload */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Webhook Payload Example
          </h2>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-100 text-sm font-mono text-gray-700 whitespace-pre-wrap">
            {JSON.stringify(webhookPayload, null, 2)}
          </div>
        </section>
      </div>
    </APIManagementLayout>
  );
};

export default index;
