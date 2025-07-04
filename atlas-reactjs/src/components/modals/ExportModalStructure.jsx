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
import { assignNodeColors, assignWbsNumbers } from "../../utils/markmapHelpers";

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

const flattenTreeData = (nodes, parentId = null) => {
  let rows = [];

  nodes.forEach((node) => {
    rows.push({
      elementName: node.name || "",
      wbsNumber: node.wbs || "",
      elementGuid: node.id || "",
      elementDescription: node.description || "",
      parentGuid: parentId || "",
      type:
        node.type === "event" ? "Event" : node.type === "gate" ? "Gate" : "",
      subtype:
        node.type === "event" ? node.eventType || "" : node.gateType || "",
      eventValue: node.eventValue || "",
      eventValueType: node.eventValueType || "",
    });

    if (node.children && node.children.length > 0) {
      rows = rows.concat(flattenTreeData(node.children, node.id));
    }
  });

  return rows;
};

const exportToJson = (rows) => {
  const blob = new Blob([JSON.stringify(rows, null, 2)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "fault-tree-export.json";
  link.click();
};

const exportToCsv = (rows) => {
  const header = [
    "Element Name",
    "WBS Number",
    "Element GUID",
    "Element Description",
    "Parent GUID",
    "Type",
    "Subtype",
    "Event Value",
    "Event Value Type",
  ];

  const csvRows = [
    header.join(","),
    ...rows.map((r) =>
      [
        r.elementName,
        r.wbsNumber,
        r.elementGuid,
        r.elementDescription,
        r.parentGuid,
        r.type,
        r.subtype,
        r.eventValue,
        r.eventValueType,
      ]
        .map((field) => `"${(field || "").replace(/"/g, '""')}"`)
        .join(",")
    ),
  ];

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "fault-tree-export.csv";
  link.click();
};

const ExportModalStructure = ({
  isOpen,
  onClose,
  treeData = [],
  showWbs = false,
  renderType,
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
  const structureType = window.location.href.includes("renderer=syncfusion");

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

      const treeDataWithWbs = assignWbsNumbers(treeData);

      const exportFns = formats.map((format) => {
        const rows = flattenTreeData(treeDataWithWbs.children || []);

        if (formats.includes("CSV")) exportToCsv(rows);
        if (formats.includes("JSON")) exportToJson(rows);

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
                  showWbs,
                  includeWbs,
                  includeTags,
                  svgContent,
                  colorStrategy
                )
              : exportAsPdf(
                  treeData,
                  showWbs,
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

          {/* Document Format Section */}
          <div className="border-b pb-6">
            <p className="font-medium">Document Format</p>
            <div className="flex flex-wrap gap-4 mt-2">
              {["DOC", "PDF", "HTML"].map((format) => (
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

          {renderType == "faultTree" && structureType && (
            <div className="border-b pb-6">
              <p className="font-medium">Fault Tree</p>
              <div className="flex flex-wrap gap-4 mt-2">
                {["CSV", "JSON"].map((format) => (
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
          )}

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
