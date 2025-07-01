import cogoToast from "@successtar/cogo-toast";
import * as d3 from "d3";
import React, { useEffect, useState } from "react";
import { LuDatabaseBackup } from "react-icons/lu";
import { RiCloseLine } from "react-icons/ri";
import {
  exportAllAsSingleDoc,
  exportAsDoc,
  exportAsHtml,
  exportAsPdf,
  exportAsSinglePdf,
} from "../../utils/exportFunctions";
import { assignNodeColors } from "../../utils/markmapHelpers";

const FORMATS = ["DOC", "PDF", "HTML"];
const OPTIONS = ["Include WBS", "Include tags"];
const DOCUMENT_ASSEMBLY = ["Single", "Multiple"];
const LEVEL_COLORS = [
  "#FF6B6B",
  "#FFD93D",
  "#6BCB77",
  "#4D96FF",
  "#F28500",
  "#9D4EDD",
  "#00C2D1",
  "#FF7DFF",
  "#72EFDD",
  "#1ABC9C",
];

const ExportModalStructure = ({
  isOpen,
  onClose,
  treeData = [],
  showWbs = false,
}) => {
  if (!isOpen) return null;

  const [assembly, setAssembly] = useState("Multiple");
  const [formats, setFormats] = useState([]);
  const [options, setOptions] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [svgContent, setSvgContent] = useState({});

  useEffect(() => {
    const handleSvgPreviewUpdate = ({ detail: { svg } }) => setSvgContent(svg);
    window.addEventListener("svgPreviewUpdate", handleSvgPreviewUpdate);

    if (window.svgPreview) setSvgContent(window.svgPreview);

    return () =>
      window.removeEventListener("svgPreviewUpdate", handleSvgPreviewUpdate);
  }, []);

  const toggle = (item, arr, setter) => {
    setter(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);
  };

  const handleExport = async () => {
    if (!formats.length || !options) {
      cogoToast.error("Please select formats and options.");
      return;
    }

    if (formats.includes("HTML") && options.includes("Include tags")) {
      cogoToast.error("Tags are not allowed when exporting in HTML format.");
      return;
    }

    setIsExporting(true);

    try {
      const includeWbs = options.includes("Include WBS");
      console.log(includeWbs);
      const includeTags = options.includes("Include tags");
      const isSyncfusion = window.location.href.includes("renderer=syncfusion");

      const isMarkmap = !isSyncfusion;

      const colorStrategy = (index) => {
        if (isMarkmap) {
          const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
          return colorScale(index);
        }
        return LEVEL_COLORS[index % LEVEL_COLORS.length];
      };

      if (isMarkmap && treeData?.children?.length > 0) {
        treeData.children.forEach((topLevelNode, index) => {
          const color = colorStrategy(index);
          assignNodeColors(topLevelNode, () => color);
        });
      }

      const exportFns = formats.map((format) => {
        if (format === "HTML") {
          return () =>
            exportAsHtml(
              treeData,
              showWbs,
              includeWbs,
              colorStrategy,
              isMarkmap
            );
        }

        if (format === "PDF") {
          return () =>
            assembly === "Single"
              ? exportAsSinglePdf(
                  treeData,
                  includeWbs,
                  includeTags,
                  svgContent,
                  colorStrategy
                )
              : exportAsPdf(
                  treeData,
                  includeWbs,
                  includeTags,
                  colorStrategy,
                  isMarkmap,
                  svgContent
                );
        }

        if (format === "DOC") {
          return () =>
            assembly === "Single"
              ? exportAllAsSingleDoc(
                  treeData,
                  showWbs,
                  includeWbs,
                  includeTags,
                  colorStrategy
                )
              : exportAsDoc(
                  treeData,
                  showWbs,
                  includeWbs,
                  includeTags,
                  colorStrategy,
                  isMarkmap
                );
        }

        return null;
      });

      for (const fn of exportFns.filter(Boolean)) await fn();

      cogoToast.success("Export successful!");
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
      cogoToast.error("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
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
              {DOCUMENT_ASSEMBLY.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 text-gray-700"
                >
                  <input
                    type="radio"
                    name="assembly"
                    checked={assembly === type}
                    onChange={() => setAssembly(type)}
                    className="h-4 w-4 accent-custom-main"
                  />
                  {type} Record
                </label>
              ))}
            </div>
          </div>

          <div className="border-b pb-6">
            <p className="font-medium">Document Format</p>
            <div className="flex flex-wrap gap-4 mt-2">
              {FORMATS.map((format) => (
                <label
                  key={format}
                  className="flex items-center gap-2 text-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={formats.includes(format)}
                    onChange={() => toggle(format, formats, setFormats)}
                    className="h-4 w-4 accent-custom-main"
                  />
                  {format}
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
                    <span className="text-red-500">*</span> HTML format does not
                    support tags.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleExport}
            disabled={formats.length === 0 || isExporting}
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
