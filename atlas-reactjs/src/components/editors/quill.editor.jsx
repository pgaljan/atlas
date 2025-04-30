import React, { useEffect, useRef } from "react";
import ReactQuill, { Quill } from "react-quill";
import PropTypes from "prop-types";
import "react-quill/dist/quill.snow.css";
import "tippy.js/dist/tippy.css";
import ImageResize from "quill-image-resize-module-react";
import "./CustomImageBlot";
import "./CustomVideoBlot";

if (!Quill.imports["modules/imageResize"]) {
  Quill.register("modules/imageResize", ImageResize);
}

const imageHandler = function () {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.click();

  input.onchange = () => {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;

      img.onload = () => {
        let quality = 0.8;
        let maxDim = 1000;
        if (file.size > 5e6) {
          quality = 0.4;
          maxDim = 600;
        } else if (file.size > 2e6) {
          quality = 0.6;
          maxDim = 800;
        }

        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            const blobReader = new FileReader();
            blobReader.onload = () => {
              const base64 = blobReader.result;
              const range = this.quill.getSelection(true);
              this.quill.insertEmbed(range.index, "image", base64, "user");
              this.quill.setSelection(range.index + 1);
            };
            blobReader.readAsDataURL(blob);
          },
          "image/jpeg",
          quality
        );
      };
    };
    reader.readAsDataURL(file);
  };
};

const videoHandler = function () {
  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("accept", "video/*");
  input.click();

  input.onchange = () => {
    const file = input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const videoDataUrl = e.target.result;
        const range = this.quill.getSelection(true);
        this.quill.insertEmbed(range.index, "video", videoDataUrl, "user");
        this.quill.setSelection(range.index + 1);
      };
      reader.readAsDataURL(file);
    }
  };
};

const QuillEditor = ({ content, onEditorChange, editorClassName }) => {
  const editorRef = useRef(null);

  const handleChange = (content) => {
    onEditorChange(content);
  };

  const modules = {
    toolbar: {
      container: [
        [{ font: [] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "strike", "blockquote", "code-block"],
        [{ color: [] }, { background: [] }],
        [
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" },
        ],
        [{ align: [] }],
        ["link", "image"],
      ],
      handlers: {
        // video: videoHandler,
        image: imageHandler,
      },
    },
    imageResize: {
      parchment: Quill.import("parchment"),
    },
  };

  const formats = [
    "header",
    "font",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "code-block",
    "color",
    "background",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    // "video",
    "align",
    "width",
    "height",
    "style",
  ];

  useEffect(() => {
    const tooltips = {
      "ql-bold": "Bold",
      "ql-italic": "Italic",
      "ql-underline": "Underline",
      "ql-strike": "Strike",
      "ql-blockquote": "Blockquote",
      "ql-code-block": "Code Block",
      "ql-list": "List",
      "ql-indent": "Indent",
      "ql-link": "Insert Link",
      "ql-image": "Insert Image",
      "ql-video": "Insert Video",
      "ql-color": "Text Color",
      "ql-background": "Background Color",
      "ql-align": "Align Text",
      "ql-font": "Font Style",
      "ql-header": "Header Size",
    };

    const toolbar = document.querySelector(".ql-toolbar");
    if (toolbar) {
      Object.entries(tooltips).forEach(([className, title]) => {
        toolbar.querySelectorAll(`.${className}`).forEach((el) => {
          if (!el.getAttribute("data-tippy-content")) {
            el.setAttribute("data-tippy-content", title);
          }
        });
      });

      import("tippy.js").then((tippy) => {
        tippy.default(".ql-toolbar [data-tippy-content]", {
          placement: "top",
          animation: "shift-away",
          arrow: true,
          theme: "custom",
          delay: [100, 0],
          duration: [200, 150],
        });
      });
    }
  }, []);

  return (
    <div className="mx-auto">
      <ReactQuill
        ref={editorRef}
        value={content}
        onChange={handleChange}
        theme="snow"
        modules={modules}
        formats={formats}
        className={editorClassName || "h-[300px] mb-[50px]"}
      />
    </div>
  );
};

QuillEditor.propTypes = {
  content: PropTypes.string.isRequired,
  onEditorChange: PropTypes.func.isRequired,
  editorClassName: PropTypes.string,
};

export default QuillEditor;
