import { useState } from "react";
import { FiCode, FiCopy, FiKey, FiTerminal } from "react-icons/fi";
import { Link } from "react-router-dom";
import APIManagementLayout from "../../../components/api-management/APIManagementLayout";

const tabs = [
  { label: "cURL", icon: <FiTerminal size={14} /> },
  { label: "JavaScript", icon: <FiCode size={14} /> },
];

const index = () => {
  const [activeTab, setActiveTab] = useState("cURL");

  const codeExamples = {
    cURL: `curl -X GET \"https://api.atlas.dev/v1/markmap/render\" \\
  -H \"Authorization: Bearer YOUR_API_KEY\"`,
    JavaScript: `fetch(\"https://api.atlas.dev/v1/markmap/render\", {
  headers: {
    Authorization: \"Bearer YOUR_API_KEY\"
  }
})
  .then(res => res.json())
  .then(data => console.log(data));`,
  };

  const response = {
    title: "Getting Started with MarkMap",
    nodes: ["root", "child1", "child2"],
    type: "mindmap",
  };

  return (
    <APIManagementLayout>
      <div className="px-6 py-6 space-y-10">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-1">
            Using the <span className="text-custom-main">MarkMap API</span>
          </h1>
          <p className="text-sm text-gray-500">
            Learn how to render mind maps from markdown using the ATLAS
            platform's MarkMap API — with token authentication and working code
            examples.
          </p>
        </div>

        {/* Step-by-Step Instructions */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            Getting Started
          </h2>

          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>
              <strong>Get your API token:</strong> Go to your{" "}
              <Link
                to="/api-management/security/keys"
                className="text-custom-main font-medium cursor-pointer hover:underline"
              >
                API Keys
              </Link>{" "}
              and generate an access token.
            </li>
            <li>
              <strong>Make an authenticated request:</strong> Use the token in
              the{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded mx-1 text-gray-800 font-mono text-xs">
                Authorization
              </code>{" "}
              header like this:
              <br />
              <code className="block bg-gray-100 px-3 py-2 mt-2 rounded text-sm font-mono">
                Authorization: Bearer YOUR_API_KEY
              </code>
            </li>
            <li>
              <strong>Read the response:</strong> The API will return a
              structured JSON object for rendering mindmaps.
            </li>
          </ol>
        </section>

        {/* Token Requirements */}
        <section className="bg-orange-50 border-l-4 border-orange-400 rounded-md px-4 py-3 text-sm text-orange-800 flex items-start gap-3">
          <FiKey className="mt-0.5" />
          <div>
            <strong>Note:</strong> All API requests require a valid token. If
            your token is missing or invalid, the server will return a{" "}
            <code className="bg-white px-1 rounded text-orange-600">
              401 Unauthorized
            </code>{" "}
            error.
          </div>
        </section>

        {/* Endpoint Info */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Endpoint</h2>
          <div className="text-sm font-mono bg-gray-50 p-3 rounded-md border border-gray-100 text-gray-700">
            GET{" "}
            <span className="text-custom-main ml-2">
              https://api.atlas.dev/v1/markmap/render
            </span>
          </div>
          <p className="text-sm text-gray-500">
            This endpoint converts markdown into a mindmap structure using
            MarkMap.
          </p>
        </section>

        {/* Code Examples */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Code Examples</h2>

          {/* Tabs */}
          <div className="flex gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm border ${
                  activeTab === tab.label
                    ? "bg-custom-main text-white border-custom-main"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab(tab.label)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Code Block */}
          <div className="relative bg-gray-900 text-white p-4 rounded-md text-sm font-mono leading-snug">
            <pre className="whitespace-pre-wrap">{codeExamples[activeTab]}</pre>
            <button
              onClick={() =>
                navigator.clipboard.writeText(codeExamples[activeTab])
              }
              className="absolute top-3 right-3 p-1.5 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition"
              title="Copy to clipboard"
            >
              <FiCopy size={16} />
            </button>
          </div>
        </section>

        {/* Sample Response */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Sample Response
          </h2>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <pre className="text-sm text-gray-700 font-mono whitespace-pre-wrap">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        </section>
      </div>
    </APIManagementLayout>
  );
};

export default index;
