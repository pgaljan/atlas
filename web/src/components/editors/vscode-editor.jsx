import Editor from "@monaco-editor/react";
import { useRef } from "react";

const VsCodeEditor = ({
  language = "plaintext",
  value = "",
  onChange,
  onMount,
  height = "100%",
  theme = "vs-dark",
  options = {},
}) => {
  const editorRef = useRef(null);
  const defaultOptions = {
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
    automaticLayout: true,
    readOnly: false,
    ...options,
  };

  return (
    <div className="relative w-full h-full">
      <Editor
        height={height}
        language={language}
        value={value}
        theme={theme}
        options={defaultOptions}
        onChange={(val) => onChange?.(val || "")}
        onMount={(editor) => {
          editorRef.current = editor;
          onMount?.(editor);
        }}
      />
    </div>
  );
};

export default VsCodeEditor;
