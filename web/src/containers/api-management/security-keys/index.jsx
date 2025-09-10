import { useState } from "react";
import { FiCopy, FiEye, FiEyeOff, FiPlus, FiTrash2 } from "react-icons/fi";
import APIManagementLayout from "../../../components/api-management/APIManagementLayout";

const APIKeysPage = () => {
  const [newLabel, setNewLabel] = useState("");
  const [copiedKey, setCopiedKey] = useState(null);
  const [visibleKeys, setVisibleKeys] = useState({});
  const [keys, setKeys] = useState([
    {
      id: 1,
      label: "My Website",
      key: "test_key_1234567890abcdef",
      created: "2024-11-02",
    },
    {
      id: 2,
      label: "Internal Dashboard",
      key: "test_key_abcdef1234567890",
      created: "2025-02-14",
    },
  ]);

  const handleCreateKey = () => {
    if (!newLabel) return;
    const newKey = {
      id: Date.now(),
      label: newLabel,
      key: `sk_live_${Math.random().toString(36).slice(2, 26)}`,
      created: new Date().toISOString().split("T")[0],
    };
    setKeys((prev) => [newKey, ...prev]);
    setNewLabel("");
  };

  const handleCopy = (key) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDelete = (id) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const toggleVisibility = (id) => {
    setVisibleKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <APIManagementLayout>
      <div className="px-6 py-6 space-y-10">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-1">
            Manage <span className="text-custom-main">API Keys</span>
          </h1>
          <p className="text-sm text-gray-500">
            Create, view, and manage your personal API keys.
          </p>
        </div>

        {/* Create Key */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Create New API Key
          </h2>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="flex-grow border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-custom-main focus:outline-none"
              placeholder="Key label (e.g. My App)"
            />
            <button
              onClick={handleCreateKey}
              className="flex items-center gap-1 text-sm px-4 py-2 bg-custom-main text-white rounded-md hover:bg-custom-main/90"
            >
              <FiPlus /> Create Key
            </button>
          </div>
        </section>

        {/* API Keys List */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Your API Keys</h2>

          {keys.length === 0 ? (
            <p className="text-sm text-gray-500">
              You haven't created any API keys yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
                  <tr>
                    <th className="px-4 py-2">Label</th>
                    <th className="px-4 py-2">Key</th>
                    <th className="px-4 py-2">Created</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((key) => (
                    <tr key={key.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{key.label}</td>
                      <td className="px-4 py-3 font-mono text-sm max-w-[240px] flex items-center gap-2">
                        <span className="truncate block overflow-hidden text-ellipsis">
                          {visibleKeys[key.id]
                            ? key.key
                            : `${"*".repeat(10)}${key.key.slice(10)}`}
                        </span>
                        <button
                          onClick={() => toggleVisibility(key.id)}
                          className="flex-shrink-0 text-gray-500 hover:text-gray-800"
                          title={visibleKeys[key.id] ? "Hide Key" : "Show Key"}
                        >
                          {visibleKeys[key.id] ? (
                            <FiEyeOff size={16} />
                          ) : (
                            <FiEye size={16} />
                          )}
                        </button>
                      </td>

                      <td className="px-4 py-3">{key.created}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleCopy(key.key)}
                          className="text-gray-500 hover:text-gray-800 p-1 mr-2"
                          title="Copy Key"
                        >
                          <FiCopy size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(key.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Delete Key"
                        >
                          <FiTrash2 size={16} />
                        </button>
                        {copiedKey === key.key && (
                          <span className="ml-2 text-xs text-green-600 font-medium">
                            Copied!
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </APIManagementLayout>
  );
};

export default APIKeysPage;
