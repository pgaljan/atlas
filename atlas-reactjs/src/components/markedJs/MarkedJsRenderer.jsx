import React, { useState, useMemo, useRef } from "react";
import marked from "./MarkedHelper";
import DOMPurify from "dompurify";
import Editor from "@monaco-editor/react";
import { CustomLoader } from "../customLoader/CustomLoader";
import { quickReferenceMarkdown } from "../../constants";
import VsCodeEditor from "../editors/VsCode.editor";

// const referenceOptions = [
//   { value: "markdown", label: "Preview" },
//   { value: "html", label: "HTML Source" },
//   { value: "lexer", label: "Lexer Data" },
//   { value: "quickReference", label: "Quick References" },
// ];

const MarkJsRenderer = ({ content, onEditorChange }) => {
  const [selectedReference, setSelectedReference] = useState("markdown");
  const [isEditorLoading, setIsEditorLoading] = useState(true);
  const editorRef = useRef(null);

  const rawHtml = useMemo(() => marked.parse(content || ""), [content]);
  const sanitizedHtml = useMemo(() => DOMPurify.sanitize(rawHtml), [rawHtml]);

    const handleChange = (value) => {
    const htmlPreview = DOMPurify.sanitize(marked.parse(value || ""));
    onEditorChange(value || "", htmlPreview);
  };

  const getPreviewContent = () => {
    switch (selectedReference) {
      case "markdown":
        return (
          <div
            className="prose prose-sm sm:prose lg:prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
        );
      case "html":
        return (
          <pre className="whitespace-pre-wrap break-words text-sm text-gray-700">
            {rawHtml}
          </pre>
        );
      case "lexer":
        const tokens = marked.lexer(content || "");

        return (
          <pre className="whitespace-pre-wrap text-sm text-gray-700">
            {JSON.stringify(tokens, null, 2)}
          </pre>
        );
      case "quickReference":
        return (
          <pre className="whitespace-pre-wrap break-words text-sm text-gray-700">
            {quickReferenceMarkdown}
          </pre>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative flex flex-row h-[480px]">
      {isEditorLoading && <CustomLoader />}
      <div
        className={`w-[30%] min-w-[540px] ${
          isEditorLoading ? "opacity-0" : "opacity-100"
        }`}
      >
        <VsCodeEditor
          language="markdown"
          value={content}
          onChange={handleChange}
          height="100%"
          theme="vs-dark"
          onMount={(editor) => {
            editorRef.current = editor;
            setIsEditorLoading(false);
          }}
        />
      </div>

      <div
        className={`flex-1 flex flex-col overflow-hidden pl-2 max-h-screen box-border transition-opacity duration-300 ${
          isEditorLoading ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quick Reference
          </label>
          <select
            value={selectedReference}
            onChange={(e) => setSelectedReference(e.target.value)}
            className="w-[710px] p-2 border rounded focus:outline-none focus:ring-2 focus:ring-custom-main"
          >
            {referenceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div> */}
        <h2 className="mb-2 text-gray-600 font-semibold">MarkedJs Preview</h2>
        <div className="flex-1 overflow-auto p-2 box-border">
          {getPreviewContent()}
        </div>
      </div>
    </div>
  );
};
export default MarkJsRenderer;
