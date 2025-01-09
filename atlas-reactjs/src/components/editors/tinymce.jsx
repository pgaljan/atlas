import { Editor } from "@tinymce/tinymce-react"
import PropTypes from "prop-types"
import React, { useRef } from "react"

const TinyMCE = ({ content, onEditorChange }) => {
  const editorRef = useRef(null)

  return (
    <div className="container mx-auto">
      <Editor
        tinymceScriptSrc={"/tinymce/tinymce.min.js"}
        onInit={(evt, editor) => (editorRef.current = editor)}
        value={content}
        init={{
          height: 300,
          menubar: false,
          plugins: [
            "advlist autolink lists link image charmap print preview anchor",
            "searchreplace visualblocks code fullscreen",
            "insertdatetime media table paste help wordcount",
            "link",
            "media",
            "image",
          ],
          toolbar:
            "undo redo | formatselect | bold italic removeformat | backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | image link media | help",
          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:16px }",
          directionality: "LTR",
          file_picker_types: "image media",
          file_picker_callback: function (callback, value, meta) {
            const input = document.createElement("input")
            input.setAttribute("type", "file")
            input.setAttribute(
              "accept",
              meta.filetype === "image" ? "image/*" : "video/*"
            )

            input.onchange = function () {
              const file = this.files[0]
              const reader = new FileReader()

              reader.onload = function () {
                const base64 = reader.result
                callback(base64, { title: file.name })
              }

              reader.readAsDataURL(file)
            }

            input.click()
          },
        }}
        onEditorChange={onEditorChange}
      />
    </div>
  )
}

TinyMCE.propTypes = {
  content: PropTypes.string,
  onEditorChange: PropTypes.func,
}

export default TinyMCE
