import {
  FiCheckCircle,
  FiClock,
  FiExternalLink,
  FiHeart,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import APIManagementLayout from "../../../components/api-management/APIManagementLayout";
import { api } from "../../../constants";

const index = () => {
  return (
    <APIManagementLayout>
      <div className="px-6 py-6 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 tracking-tight mb-1">
              {api.name}
            </h1>
            <p className="text-sm text-gray-500">
              Provided by{" "}
              <span className="text-custom-main font-medium">
                {api.provider}
              </span>{" "}
              • Updated {api.updated}
            </p>
          </div>
          <button
            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition"
            title="Remove from favorites"
          >
            <FiHeart className="fill-current" size={18} />
          </button>
        </div>

        {/* Overview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category + Description */}
            <div>
              <span className="inline-block bg-gray-700 text-white text-xs px-3 py-1 rounded-full mb-3">
                {api.category}
              </span>
              <p className="text-sm text-gray-600">{api.description}</p>
            </div>

            {/* Metadata Table */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-gray-700">
              <div>
                <span className="block text-gray-500 text-xs mb-1">Status</span>
                <span className="font-medium text-green-600">{api.status}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs mb-1">Format</span>
                <span className="font-medium">{api.format}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs mb-1">
                  Version
                </span>
                <span className="font-medium">{api.version}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs mb-1">
                  Latency
                </span>
                <span className="font-medium flex items-center gap-1">
                  <FiClock size={14} /> {api.latency}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs mb-1">Uptime</span>
                <span className="font-medium flex items-center gap-1">
                  <FiCheckCircle size={14} /> {api.uptime}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs mb-1">
                  Base URL
                </span>
                <span className="block break-all text-custom-main">
                  {api.baseUrl}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs mb-1">Auth</span>
                <span className="font-medium">{api.auth}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs mb-1">
                  Rate Limit
                </span>
                <span className="font-medium">{api.rateLimit}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs mb-1">Errors</span>
                <span className="font-medium">{api.errorFormat}</span>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <span className="block text-gray-500 text-xs mb-1">
                  Documentation
                </span>
                <a
                  href={api.docs}
                  target="_blank"
                  rel="noreferrer"
                  className="text-custom-main hover:underline text-sm break-words"
                >
                  {api.docs}
                </a>
              </div>
            </div>

            {/* New: Pricing Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Pricing
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-gray-700">
                <div>
                  <span className="block text-gray-500 text-xs mb-1">
                    Input Price
                  </span>
                  <span className="font-medium">$2.00 / 1M tokens</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-xs mb-1">
                    Cached Input Price
                  </span>
                  <span className="font-medium">$0.50 / 1M tokens</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-xs mb-1">
                    Output Price
                  </span>
                  <span className="font-medium">$8.00 / 1M tokens</span>
                </div>
              </div>
            </div>

            {/* New: Features Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Features
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                <li>Streaming Supported</li>
                <li>Function Calling Supported</li>
                <li>Structured Outputs Supported</li>
                <li>Fine-tuning Supported</li>
                <li>Distillation Supported</li>
                <li>Predicted Outputs Supported</li>
                <li>Web search Supported</li>
                <li>File Search Supported</li>
                <li>Image Generation Supported</li>
                <li>Code Interpreter Supported</li>
              </ul>
            </div>

            {/* Rate Limits */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Rate Limits
              </h3>
              <p className="text-sm text-gray-600">
                Tier 1: 500 RPM, 30,000 TPM
              </p>
              <p className="text-sm text-gray-600">
                Tier 2: 5,000 RPM, 450,000 TPM
              </p>
              <p className="text-sm text-gray-600">
                Tier 3: 5,000 RPM, 800,000 TPM
              </p>
              <p className="text-sm text-gray-600">
                Tier 4: 10,000 RPM, 2,000,000 TPM
              </p>
              <p className="text-sm text-gray-600">
                Tier 5: 10,000 RPM, 30,000,000 TPM
              </p>
            </div>

            {/* Use Cases */}
            <div className="pt-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Use Cases
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                {api.useCases.map((use, idx) => (
                  <li key={idx}>{use}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Action Panel */}
          <div className="bg-white border border-gray-200 h-fit !max-h-[300px] rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-gray-800">Actions</h3>
            <Link to="/api-management/try-it" className="w-full bg-custom-main text-white py-2 rounded-md text-sm font-medium hover:bg-custom-main/90  flex justify-center items-center gap-2">
              Try API <FiExternalLink size={14} />
            </Link>
            <button className="w-full bg-gray-100 text-gray-800 py-2 rounded-md text-sm font-medium hover:bg-gray-200 flex justify-center items-center gap-2">
              Add to Favorites
            </button>
          </div>
        </div>
      </div>
    </APIManagementLayout>
  );
};

export default index;
