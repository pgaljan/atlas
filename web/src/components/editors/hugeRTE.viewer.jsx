import PropTypes from "prop-types";
import tinymce from "hugerte";
import { useEffect, useRef } from "react";

// Configure HugeRTE to use public folder assets
if (typeof window !== "undefined" && tinymce) {
  tinymce.baseURL = "/hugerte";
  tinymce.suffix = "";
}

const HugeRTEViewer = ({ content, className }) => {
  const viewerRef = useRef();
  const editorInstanceRef = useRef(null);

  useEffect(() => {
    if (viewerRef.current && !editorInstanceRef.current) {
      tinymce.init({
        target: viewerRef.current,
        height: 400,
        menubar: false,
        toolbar: false,
        readonly: true,
        statusbar: false,
        setup(editor) {
          editorInstanceRef.current = editor;

          editor.on("init", () => {
            editor.setContent(content || "");
          });
        },
        content_style: `
          body { 
            font-family: Arial, sans-serif; 
            font-size: 14px; 
            padding: 10px;
            background: transparent;
          }
          img { max-width: 100%; height: auto; }
        `,
      });
    }

    return () => {
      if (editorInstanceRef.current) {
        tinymce.remove(viewerRef.current);
        editorInstanceRef.current = null;
      }
    };
  }, []);

  // Update content when prop changes
  useEffect(() => {
    if (editorInstanceRef.current && content !== undefined) {
      const currentContent = editorInstanceRef.current.getContent();
      if (currentContent !== content) {
        editorInstanceRef.current.setContent(content || "");
      }
    }
  }, [content]);

  return (
    <div className={className}>
      <textarea ref={viewerRef} style={{ display: "none" }} />
    </div>
  );
};

HugeRTEViewer.propTypes = {
  content: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default HugeRTEViewer;
