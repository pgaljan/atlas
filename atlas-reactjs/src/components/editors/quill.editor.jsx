import React, { useRef } from "react";
import ReactQuill from "react-quill";
import PropTypes from "prop-types";
import "react-quill/dist/quill.snow.css";

const QuillEditor = ({ content, onEditorChange }) => {
  const editorRef = useRef(null);

  return (
    <div className="container mx-auto">
      <ReactQuill
        ref={editorRef}
        value={content}
        onChange={onEditorChange}
        theme="snow"
        modules={{
          toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            ["clean"],
          ],
        }}
        formats={[
          "header",
          "bold",
          "italic",
          "underline",
          "strike",
          "list",
          "bullet",
          "link",
          "image",
        ]}
        style={{ height: "250px", marginBottom: "50px" }}
      />
    </div>
  );
};

QuillEditor.propTypes = {
  content: PropTypes.string.isRequired,
  onEditorChange: PropTypes.func.isRequired,
};

export default QuillEditor;
