import React, { useState } from "react";
import APIManagementLayout from "../../../components/api-management/APIManagementLayout";
import { FiUpload, FiTrash2 } from "react-icons/fi";

const index = () => {
  const [certificates, setCertificates] = useState([
    {
      id: 1,
      name: "TLS Certificate - Atlas API",
      issuer: "Let's Encrypt",
      issuedOn: "2024-06-01",
      expiresOn: "2025-06-01",
      fingerprint: "D3:29:C5:8A:5F:14:6E:93...",
    },
    {
      id: 2,
      name: "Wildcard Certificate - *.atlas.dev",
      issuer: "Cloudflare",
      issuedOn: "2023-12-15",
      expiresOn: "2024-12-15",
      fingerprint: "E7:48:CD:2F:1B:67:DE:90...",
    },
  ]);

  const handleDelete = (id) => {
    setCertificates((prev) => prev.filter((cert) => cert.id !== id));
  };

  return (
    <APIManagementLayout>
      <div className="px-6 py-6 space-y-10">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-1">
            Security <span className="text-custom-main">Certificates</span>
          </h1>
          <p className="text-sm text-gray-500">
            Manage TLS/SSL certificates used to secure your APIs and domains.
          </p>
        </div>

        {/* Upload Certificate */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Upload New Certificate
          </h2>
          <form className="flex flex-col sm:flex-row gap-3">
            <input
              type="file"
              accept=".crt,.pem"
              className="flex-grow text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
            />
            <button
              type="submit"
              className="flex items-center gap-1 text-sm px-4 py-2 bg-custom-main text-white rounded-md hover:bg-custom-main/90"
            >
              <FiUpload /> Upload
            </button>
          </form>
        </section>

        {/* Certificates Table */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Your Certificates
          </h2>

          {certificates.length === 0 ? (
            <p className="text-sm text-gray-500">
              No certificates have been uploaded yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
                  <tr>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Issuer</th>
                    <th className="px-4 py-2">Issued On</th>
                    <th className="px-4 py-2">Expires On</th>
                    <th className="px-4 py-2">Fingerprint</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((cert) => (
                    <tr
                      key={cert.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3">{cert.name}</td>
                      <td className="px-4 py-3">{cert.issuer}</td>
                      <td className="px-4 py-3">{cert.issuedOn}</td>
                      <td className="px-4 py-3">{cert.expiresOn}</td>
                      <td className="px-4 py-3 font-mono truncate max-w-[200px]">
                        {cert.fingerprint}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(cert.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Delete Certificate"
                        >
                          <FiTrash2 size={16} />
                        </button>
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

export default index;
