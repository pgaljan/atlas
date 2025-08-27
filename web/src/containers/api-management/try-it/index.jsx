import { useState } from "react";
import {
  FiAlertCircle,
  FiCheck,
  FiCode,
  FiLink,
  FiRefreshCw,
  FiSend,
} from "react-icons/fi";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import APIManagementLayout from "../../../components/api-management/APIManagementLayout";

const codeSnippets = {
  curl: `curl -X GET \\
--url 'https://api.atlas.dev/v1/markmap/render' \\
--header 'Authorization: Bearer YOUR_API_KEY'`,
  php: `<?php
$curl = curl_init();
curl_setopt_array($curl, [
  CURLOPT_URL => "https://api.atlas.dev/v1/markmap/render",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => [
    "Authorization: Bearer YOUR_API_KEY"
  ],
]);
$response = curl_exec($curl);
curl_close($curl);
echo $response;
?>`,
  node: `const fetch = require("node-fetch");
fetch("https://api.atlas.dev/v1/markmap/render", {
  headers: {
    Authorization: "Bearer YOUR_API_KEY",
  },
  method: "POST",
  body: JSON.stringify({ key: "value" })
})
  .then(res => res.json())
  .then(data => console.log(data));`,
  nestjs: `@Injectable()
export class ApiService {
  constructor(private readonly httpService: HttpService) {}

  async fetchData() {
    const response = await this.httpService
      .get('https://api.atlas.dev/v1/markmap/render', {
        headers: {
          Authorization: 'Bearer YOUR_API_KEY',
        },
        params: { key: "value" }
      })
      .toPromise();

    return response.data;
  }
}`,
};

const index = () => {
  const [method, setMethod] = useState("GET");
  const [apiKey, setApiKey] = useState("");
  const [requestBody, setRequestBody] = useState("{}");
  const [params, setParams] = useState("");
  const [activeTab, setActiveTab] = useState("body");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSnippet, setActiveSnippet] = useState("curl");

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("https://api.atlas.dev/v1/markmap/render", {
        method: method,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body:
          method !== "GET" && activeTab === "body" ? requestBody : undefined,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Request failed");
      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSnippetWithKey = (snippet) =>
    snippet.replace(/YOUR_API_KEY/g, apiKey || "YOUR_API_KEY");

  return (
    <APIManagementLayout>
      <div className="px-6 py-6 space-y-12">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-gray-800 mb-1">
            Test Your API on <span className="text-custom-main">Atlas</span>
          </h1>
          <p className="text-sm text-gray-500">
            Use your API key below to make a real-time request to the endpoint.
          </p>
        </div>

        {/* Request Builder */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1">
              HTTP Method
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          {/* Auth */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1">
              Authorization (Bearer Token)
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              placeholder="Enter Bearer Token"
            />
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 text-sm font-medium mt-2">
            {["body", "params"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-md border ${
                  activeTab === tab
                    ? "bg-custom-main text-white border-custom-main"
                    : "bg-white text-gray-600 border-gray-300"
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          {activeTab === "params" ? (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1">
                Parameters
              </label>
              <textarea
                value={params}
                onChange={(e) => setParams(e.target.value)}
                className="w-full h-24 border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="Enter your request parameters"
              />
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1">
                Request Body
              </label>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                className="w-full h-24 border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder='e.g. { "key": "value" }'
              />
            </div>
          )}

          {/* Endpoint */}
          <div className="text-sm text-gray-700 border-t pt-4 mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <FiLink className="text-gray-500" />
              <span className="font-medium">{method}</span>
              <code className="bg-gray-50 px-2 py-0.5 rounded border text-xs">
                https://api.atlas.dev/v1/markmap/render
              </code>
            </div>
          </div>

          {/* Send */}
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={handleSubmit}
              disabled={loading || !apiKey}
              className="flex items-center gap-2 bg-custom-main text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-custom-main/90 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <FiRefreshCw className="animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <FiSend /> Send Request
                </>
              )}
            </button>
            {response && !error && (
              <span className="flex items-center gap-1 text-green-600 text-sm">
                <FiCheck /> Success
              </span>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-600 flex items-center gap-2 mt-3">
              <FiAlertCircle /> {error}
            </div>
          )}
        </section>

        {/* Response */}
        {response && (
          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FiCode /> Response JSON
            </h3>
            <pre className="bg-gray-100 border border-gray-200 rounded-md p-4 text-sm text-gray-800 font-mono whitespace-pre-wrap">
              {JSON.stringify(response, null, 2)}
            </pre>
          </section>
        )}

        {/* Code Snippets */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FiCode /> Code Snippets
          </h3>

          <div className="flex space-x-2 mb-4">
            {Object.keys(codeSnippets).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveSnippet(lang)}
                className={`px-3 py-1 text-sm rounded-md border ${
                  activeSnippet === lang
                    ? "bg-custom-main text-white border-custom-main"
                    : "bg-white text-gray-600 border-gray-300"
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          <SyntaxHighlighter
            language={activeSnippet}
            style={oneLight}
            customStyle={{
              borderRadius: "0.5rem",
              padding: "1rem",
              fontSize: "0.85rem",
              backgroundColor: "#f8f8f8",
            }}
          >
            {getSnippetWithKey(codeSnippets[activeSnippet])}
          </SyntaxHighlighter>
        </section>
      </div>
    </APIManagementLayout>
  );
};

export default index;
