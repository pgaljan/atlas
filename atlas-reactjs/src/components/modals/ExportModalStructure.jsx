import React, { useState } from "react";
import { RiCloseLine } from "react-icons/ri";
import { LuDatabaseBackup } from "react-icons/lu";
import cogoToast from "@successtar/cogo-toast";

const ExportModalStructure = ({ isOpen, onClose, onExport }) => {
  if (!isOpen) return null;

  const FORMATS = ["DOC", "PDF", "HTML"];
  const OPTIONS = ["Include WBS", "Include tags"];
  const DocumentAssembly = ["Single", "Multiple"];

  const [assembly, setAssembly] = useState("Multiple");
  const [formats, setFormats] = useState([]);
  const [options, setOptions] = useState([]);
  const [isExporting, setIsExporting] = useState(false);

  const toggle = (item, arr, set) =>
    set(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);

  const handleExport = async () => {
    if (
      formats.length === 1 &&
      formats[0] === "HTML" &&
      options.includes("Include tags")
    ) {
      cogoToast.error("Tags are not allowed when exporting in HTML format.");
      return;
    }
    setIsExporting(true);

    await onExport({
      assembly,
      formats,
      includeWbs: options.includes("Include WBS"),
      includeTags: options.includes("Include tags"),
    });

    setIsExporting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-2xl font-bold">Export</h2>
          <button onClick={onClose}>
            <RiCloseLine size={24} />
          </button>
        </div>

        <div className="py-6 space-y-6">
          <div className="border-b pb-6">
            <p className="font-medium">Document Assembly</p>
            <div className="flex gap-6 mt-2">
              {DocumentAssembly.map((v) => (
                <label
                  key={v}
                  className="flex items-center gap-2 text-gray-700"
                >
                  <input
                    type="radio"
                    name="assembly"
                    checked={assembly === v}
                    onChange={() => setAssembly(v)}
                    className="h-4 w-4 accent-custom-main"
                  />
                  {v} Record
                </label>
              ))}
            </div>
          </div>

          <div className="border-b pb-6">
            <p className="font-medium">Document Format</p>
            <div className="flex flex-wrap gap-4 mt-2">
              {FORMATS.map((fmt) => (
                <label
                  key={fmt}
                  className="flex items-center gap-2 text-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={formats.includes(fmt)}
                    onChange={() => toggle(fmt, formats, setFormats)}
                    className="h-4 w-4 accent-custom-main"
                  />
                  {fmt}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {OPTIONS.map((opt) => (
              <div key={opt}>
                <label className="flex items-center gap-2 text-gray-700">
                  <input
                    type="checkbox"
                    checked={options.includes(opt)}
                    onChange={() => toggle(opt, options, setOptions)}
                    className="h-4 w-4 accent-custom-main"
                  />
                  {opt}
                </label>
                {opt === "Include tags" && (
                  <p className="text-sm text-gray-500 mt-2">
                    <span className="text-red-500">*</span> HTML format does not support tags.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleExport}
            disabled={formats.length === 0}
            className="flex items-center bg-custom-main text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LuDatabaseBackup size={20} className="mr-2" />
            {isExporting ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModalStructure;
