import React, {
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
} from "react";
import plantumlEncoder from "plantuml-encoder";
import { CustomLoader } from "../customLoader/CustomLoader";
import VsCodeEditor from "../editors/VsCode.editor";

const PlantUMLRenderer = ({ content, onEditorChange, onSvgChange }) => {
  const [umlText, setUmlText] = useState(content || "");
  const [isEditorLoading, setIsEditorLoading] = useState(true);
  const [rawSvg, setRawSvg] = useState(""); 
  const svgContainerRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    setUmlText(content || "");
  }, [content]);

  const encodedUrl = useMemo(() => {
    try {
      const encoded = plantumlEncoder.encode(umlText);
      return `https://www.plantuml.com/plantuml/svg/${encoded}`;
    } catch {
      return null;
    }
  }, [umlText]);

  const fetchSvgText = useCallback(async () => {
    if (!encodedUrl) return null;

    try {
      const response = await fetch(encodedUrl);
      const svgText = await response.text();
      return svgText;
    } catch (error) {
      console.error("Failed to fetch SVG", error);
      return null;
    }
  }, [encodedUrl]);

  useEffect(() => {
    const sendSvg = async () => {
      const svgText = await fetchSvgText();
      if (svgText) {
        setRawSvg(svgText);
        if (onSvgChange) onSvgChange(svgText);
      }
    };

    if (encodedUrl) {
      sendSvg();
    }
  }, [encodedUrl, fetchSvgText, onSvgChange]);

  const handleEditorChange = useCallback(
    (value) => {
      const updated = value || "";
      setUmlText(updated);
      onEditorChange?.(updated);
    },
    [onEditorChange]
  );

  const handleEditorMount = useCallback((editor) => {
    editorRef.current = editor;
    setIsEditorLoading(false);
  }, []);

  return (
    <div className="relative flex flex-row h-[480px]">
      {isEditorLoading && <CustomLoader />}

      <div
        className={`w-[30%] min-w-[540px] ${
          isEditorLoading ? "opacity-0" : "opacity-100"
        }`}
      >
        <VsCodeEditor
          language="plaintext"
          value={umlText}
          onChange={handleEditorChange}
          height="100%"
          theme="vs-dark"
          onMount={handleEditorMount}
        />
      </div>

      <div
        className={`flex-1 flex flex-col overflow-hidden pl-2 max-h-screen box-border transition-opacity duration-300 ${
          isEditorLoading ? "opacity-0" : "opacity-100"
        }`}
      >
        <h2 className="mb-2 text-gray-600 font-semibold">PlantUML Preview</h2>
        <div className="flex-1 overflow-auto p-2 box-border">
          {!isEditorLoading && encodedUrl ? (
            <img
              src={encodedUrl}
              alt="PlantUML Diagram"
              className="max-w-full max-h-full select-none"
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          ) : (
            <div className="text-red-500">Invalid UML code</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlantUMLRenderer;
