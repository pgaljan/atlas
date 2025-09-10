import cogoToast from "@successtar/cogo-toast";
import PropTypes from "prop-types";
import { useEffect, useRef } from "react";
import tinymce from "hugerte";

if (typeof window !== "undefined" && tinymce) {
  tinymce.baseURL = "/hugerte";
  tinymce.suffix = "";
}

const HugeRTEEditor = ({ content, onEditorChange, editorClassName }) => {
  const editorRef = useRef();
  const editorInstanceRef = useRef(null);
  const isUpdatingContent = useRef(false);
  const lastSetContent = useRef("");
  const isInitialized = useRef(false);
  const contentQueue = useRef(null);

  const handlePaste = (e) => {
    const clipboardItems = e.clipboardData.items;
    for (let i = 0; i < clipboardItems.length; i++) {
      const item = clipboardItems[i];
      if (item.type.indexOf("image") !== -1) {
        e.preventDefault();
        cogoToast.warn("Please use the toolbar to insert images.");
        return;
      }
    }
  };

  useEffect(() => {
    const initEditor = async () => {
      if (!tinymce || !tinymce.init) {
        setTimeout(initEditor, 100);
        return;
      }

      if (editorRef.current && !editorInstanceRef.current && tinymce) {
        try {
          await tinymce.init({
            target: editorRef.current,
            height: 400,
            menubar: false,
            statusbar: false,
            plugins: [
              "advlist",
              "lists",
              "link",
              "image",
              "media",
              "table",
              "emoticons",
              "codesample",
            ],
            toolbar: [
              "bold italic underline strikethrough blockquote codesample",
              "forecolor backcolor",
              "bullist numlist",
              "link unlink image table",
            ].join(" | "),
            branding: false,
            resize: true,
            paste_data_images: true,
            toolbar_mode: "wrap",
            font_formats:
              "Arial=arial,helvetica,sans-serif; Times New Roman=times new roman,times,serif; Courier New=courier new,courier,monospace; Helvetica=helvetica,arial,sans-serif; Georgia=georgia,serif; Verdana=verdana,arial,sans-serif; Comic Sans MS=comic sans ms,sans-serif; Impact=impact,sans-serif; Trebuchet MS=trebuchet ms,sans-serif",
            fontsize_formats: "8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt 48pt",
            table_default_attributes: {
              border: "1",
            },
            table_default_styles: {
              "border-collapse": "collapse",
              width: "100%",
            },
            image_advtab: true,
            image_caption: true,
            image_title: true,
            image_uploadtab: false,
            image_description: true,
            images_file_types: "jpg,jpeg,png,gif,webp,svg,bmp,ico,tiff,tif",
            file_picker_types: "image",
            file_picker_callback: (callback, _value, meta) => {
              if (meta.filetype === "image") {
                const input = document.createElement("input");
                input.setAttribute("type", "file");
                input.setAttribute(
                  "accept",
                  "image/*,.svg,.webp,.bmp,.ico,.tiff,.tif"
                );

                input.onchange = function () {
                  const file = this.files[0];
                  if (file) {
                    const validTypes = [
                      "image/jpeg",
                      "image/jpg",
                      "image/png",
                      "image/gif",
                      "image/webp",
                      "image/svg+xml",
                      "image/bmp",
                      "image/ico",
                      "image/tiff",
                      "image/tif",
                    ];

                    if (!validTypes.includes(file.type)) {
                      cogoToast.error("Please select a valid image file");
                      return;
                    }

                    const reader = new FileReader();
                    reader.onload = () => {
                      callback(reader.result, {
                        alt: file.name.replace(/\.[^/.]+$/, ""),
                        title: file.name.replace(/\.[^/.]+$/, ""),
                      });
                    };
                    reader.onerror = () => {
                      cogoToast.error("Error reading file");
                    };
                    reader.readAsDataURL(file);
                  }
                };

                input.click();
              }
            },
            link_title: true,
            target_list: [
              { title: "None", value: "" },
              { title: "Same page", value: "_self" },
              { title: "New window", value: "_blank" },
            ],
            codesample_languages: [
              { text: "HTML/XML", value: "markup" },
              { text: "JavaScript", value: "javascript" },
              { text: "CSS", value: "css" },
              { text: "PHP", value: "php" },
              { text: "Ruby", value: "ruby" },
              { text: "Python", value: "python" },
              { text: "Java", value: "java" },
              { text: "C", value: "c" },
              { text: "C#", value: "csharp" },
              { text: "C++", value: "cpp" },
            ],
            templates: [
              {
                title: "Basic Template",
                description: "Basic template with heading and paragraph",
                content: "<h2>Heading</h2><p>Your content goes here...</p>",
              },
              {
                title: "Two Column Layout",
                description: "Two column layout template",
                content:
                  '<div style="display: flex; gap: 20px;"><div style="flex: 1;"><h3>Column 1</h3><p>Content for first column</p></div><div style="flex: 1;"><h3>Column 2</h3><p>Content for second column</p></div></div>',
              },
            ],
            wordcount_countregex: /[\w\u2019\'-]+/g,
            quickbars_selection_toolbar:
              "bold italic | quicklink h2 h3 blockquote",
            quickbars_insert_toolbar: "quickimage quicktable",
            contextmenu: "link image table",
            setup(editor) {
              editorInstanceRef.current = editor;

              editor.ui.registry.addButton("customimage", {
                text: "Image",
                onAction: () => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        const base64 = reader.result;
                        editor.insertContent(
                          `<img src="${base64}" style="max-width: 100%; height: auto;" />`
                        );
                      };
                      reader.readAsDataURL(file);
                    }
                  };
                  input.click();
                },
              });

              editor.addCommand("mceColorPicker", (_ui, value) => {
                if (value && value.type === "forecolor") {
                  editor.execCommand("ForeColor", false, value.color);
                } else if (value && value.type === "backcolor") {
                  editor.execCommand("HiliteColor", false, value.color);
                }
              });

              editor.on("Change KeyUp Paste Undo Redo", () => {
  if (isUpdatingContent.current) return;

  try {
    let newContent = editor.getContent().trim();

    if (
      !newContent ||
      newContent === "<p><br></p>" ||
      newContent === "<p></p>" ||
      newContent === "<div></div>"
    ) {
      newContent = "";
    }

    if (newContent !== lastSetContent.current) {
      onEditorChange(newContent);
    }
  } catch (error) {
    cogoToast.error("Content change error: " + error?.message);
  }
});
              editor.on("init", () => {
                try {
                  isInitialized.current = true;
                  const setInitialContent = (retryCount = 0) => {
                    try {
                      const contentToSet =
                        contentQueue.current || content || "";
                      if (contentToSet) {
                        editor.setContent(contentToSet, { format: "html" });
                        lastSetContent.current = contentToSet;
                        contentQueue.current = null;
                      }
                    } catch (error) {
                      if (retryCount < 3) {
                        setTimeout(
                          () => setInitialContent(retryCount + 1),
                          100
                        );
                      } else {
                        cogoToast.error(
                          "Content initialization error: " + error?.message
                        );
                      }
                    }
                  };

                  setTimeout(setInitialContent, 100);
                } catch (error) {
                  cogoToast.error(
                    "Editor initialization error: " + error?.message
                  );
                }
              });

              editor.on("paste", handlePaste);
            },
            content_style: `
              body { 
                font-family: Arial, sans-serif; 
                font-size: 14px; 
                margin: 10px;
                line-height: 1.4;
              }
              img { max-width: 100%; height: auto; }
            `,
          });
        } catch (error) {
          cogoToast.error("HugeRTE initialization error: " + error?.message);
          editorRef.current.style.display = "block";
          editorRef.current.style.width = "100%";
          editorRef.current.style.minHeight = "300px";
          editorRef.current.style.padding = "10px";
          editorRef.current.style.border = "1px solid #ccc";
          editorRef.current.style.borderRadius = "4px";
          editorRef.current.value = content || "";
          editorRef.current.addEventListener("input", (e) => {
            onEditorChange(e.target.value);
          });
        }
      }
    };

    initEditor();

    return () => {
      if (editorInstanceRef.current) {
        try {
          tinymce.remove(editorRef.current);
        } catch (error) {
          cogoToast.error("HugeRTE cleanup error: " + error?.message);
        }
        editorInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isInitialized.current && content) {
      contentQueue.current = content;
      return;
    }

    if (
      editorInstanceRef.current &&
      content !== undefined &&
      isInitialized.current
    ) {
      try {
        const currentContent = editorInstanceRef.current.getContent();
        const normalizeContent = (html) => {
          return html ? html.replace(/\s+/g, " ").trim() : "";
        };

        const normalizedCurrent = normalizeContent(currentContent);
        const normalizedNew = normalizeContent(content);

        if (
          normalizedCurrent !== normalizedNew &&
          content !== lastSetContent.current
        ) {
          const updateContent = (retryCount = 0) => {
            try {
              if (!isUpdatingContent.current) {
                isUpdatingContent.current = true;
                editorInstanceRef.current.setContent(content, {
                  format: "html",
                });
                lastSetContent.current = content;
                setTimeout(() => {
                  isUpdatingContent.current = false;
                }, 150);
              }
            } catch (error) {
              if (retryCount < 2) {
                setTimeout(() => updateContent(retryCount + 1), 200);
              } else {
                cogoToast.error(
                  "Content update failed: " +
                    (error?.message || "Unknown error")
                );
                isUpdatingContent.current = false;
              }
            }
          };

          setTimeout(updateContent, 100);
        }
      } catch (error) {
        cogoToast.error(
          "Content update error: " + (error?.message || "Unknown error")
        );
      }
    }
  }, [content]);

  return (
    <div className="mx-auto" onPaste={handlePaste}>
      <textarea
        ref={editorRef}
        className={editorClassName || "h-[300px] mb-[50px]"}
        placeholder="Write something here..."
      />
    </div>
  );
};

HugeRTEEditor.propTypes = {
  content: PropTypes.string.isRequired,
  onEditorChange: PropTypes.func.isRequired,
  editorClassName: PropTypes.string,
};

export default HugeRTEEditor;
