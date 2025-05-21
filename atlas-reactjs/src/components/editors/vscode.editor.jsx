import { useRef, useState, useEffect } from "react";
import Mermaid from "../marmeid/marmaid";
import Editor from "@monaco-editor/react";

const VscodeEditor = ({ content, onEditorChange, onSvgChange }) => {
  const editorRef = useRef(null);
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
    if (onSvgChange) {
      onSvgChange(svg);
    }
  };

  const CustomLoader = () => (
    <div className="absolute inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-custom-main border-t-transparent"></div>
    </div>
  );

  return (
    <div className="relative flex flex-row h-[500px]">
      {isEditorLoading && <CustomLoader />}

      <div
        className={`w-[30%] min-w-[540px] ${
          isEditorLoading ? "opacity-0" : "opacity-100"
        }`}
      >
        <Editor
          height="100%"
          language="plaintext"
          value={diagramCode}
          theme="vs-dark"
          onChange={handleCodeChange}
          options={{
            lineNumbers: "on",
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            folding: true,
            autoIndent: "advanced",
            tabSize: 2,
            cursorSmoothCaretAnimation: true,
            renderLineHighlight: "all",
            overviewRulerLanes: 3,
            fontSize: 14,
            quickSuggestions: true,
            parameterHints: { enabled: true },
            codeLens: true,
            contextmenu: true,
            inlineHints: true,
            readOnly: false,
          }}
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
        <h2 className="mb-2 text-gray-600 font-semibold">Diagram Preview</h2>
        <div className="flex-1 overflow-auto p-2 box-border">
          {!isEditorLoading ? (
            <Mermaid code={diagramCode} onSvgChange={handleSvg} />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default VscodeEditor;
