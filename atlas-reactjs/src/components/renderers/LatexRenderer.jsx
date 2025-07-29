import { useState, useEffect } from "react";
import { CustomLoader } from "../custom-loader";
import VsCodeEditor from "../editors/vscode-editor";
import katex from "katex";
import "katex/dist/katex.min.css";

const LatexRenderer = ({ content, onEditorChange, onSvgChange }) => {
  const [latexCode, setLatexCode] = useState(content || "");
  const [isEditorLoading, setIsEditorLoading] = useState(true);
  const [renderedLatex, setRenderedLatex] = useState("");

  const handleCodeChange = (value) => {
    const val = value || "";
    setLatexCode(val);
    onEditorChange?.(val);
  };

  useEffect(() => {
    setLatexCode(content || "");
  }, [content]);

  useEffect(() => {
    try {
      const html = katex.renderToString(latexCode, {
        displayMode: true,
        throwOnError: false,
        output: "html",
      });

      setRenderedLatex(html);

      // Convert HTML to SVG
      const svgData = `<svg xmlns="http://www.w3.org/2000/svg">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">${html}</div>
        </foreignObject>
      </svg>`;
      onSvgChange?.(svgData);
    } catch (error) {
      setRenderedLatex(
        `<pre style="color: red;">Error rendering LaTeX: ${error?.message}</pre>`
      );
      onSvgChange?.(null);
    }
  }, [latexCode]);

  return (
    <div className="relative flex flex-row h-[480px]">
      {isEditorLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white dark:bg-gray-900">
          <CustomLoader />
        </div>
      )}

      <div
        className={`w-[30%] min-w-[540px] transition-opacity duration-300 ${
          isEditorLoading ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <VsCodeEditor
          language="latex"
          value={latexCode}
          onChange={handleCodeChange}
          height="100%"
          theme="vs-dark"
          onMount={() => setIsEditorLoading(false)}
        />
      </div>

      <div
        className={`flex-1 flex flex-col overflow-hidden pl-2 max-h-screen box-border transition-opacity duration-300 ${
          isEditorLoading ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <h2 className="mb-2 text-gray-600 font-semibold">LaTeX Preview</h2>
        <div
          className="flex-1 overflow-auto p-4 box-border"
          dangerouslySetInnerHTML={{ __html: renderedLatex }}
        />
      </div>
    </div>
  );
};

export default LatexRenderer;
