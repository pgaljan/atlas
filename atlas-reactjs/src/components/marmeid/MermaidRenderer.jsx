import { useEffect, useRef, useState } from "react";
import Mermaid from "./marmaidHelper";
import { CustomLoader } from "../customLoader/CustomLoader";
import VsCodeEditor from "../editors/vscode-editor";

const MermaidRenderer = ({ content, onEditorChange, onSvgChange }) => {
  const svgRef = useRef(null);
  const [diagramCode, setDiagramCode] = useState(content);
  const [isEditorLoading, setIsEditorLoading] = useState(true);

  const handleCodeChange = (value) => {
    const val = value || "";
    setDiagramCode(val);
    onEditorChange(val);
  };

  useEffect(() => {
    setDiagramCode(content);
  }, [content]);

  const handleSvg = (svg) => {
    svgRef.current = svg;
    window.svgPreview = svg;
    window.dispatchEvent(
      new CustomEvent("svgPreviewUpdate", { detail: { svg } })
    );
    onSvgChange?.(svg);
  };

  return (
    <div className="relative flex flex-row h-[480px]">
      {isEditorLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white dark:bg-gray-900">
          <CustomLoader />
        </div>
      )}
      <div className="w-[30%] min-w-[540px] z-0">
        <VsCodeEditor
          language="plaintext"
          value={diagramCode}
          onChange={handleCodeChange}
          onMount={() => setIsEditorLoading(false)}
        />
      </div>
      <div
        className={`flex-1 flex flex-col overflow-hidden pl-2 max-h-screen box-border transition-opacity duration-300 ${
          isEditorLoading ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <h2 className="mb-2 text-gray-600 font-semibold">Mermaid Preview</h2>
        <div className="flex-1 overflow-auto p-2 box-border">
          <Mermaid code={diagramCode} onSvgChange={handleSvg} />
        </div>
      </div>
    </div>
  );
};

export default MermaidRenderer;
