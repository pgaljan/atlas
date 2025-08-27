import cogoToast from "@successtar/cogo-toast"
import DOMPurify from "dompurify"
import { useCallback, useEffect, useState } from "react"
import { BsTags } from "react-icons/bs"
import { IoTrash } from "react-icons/io5"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import marked from "../../helpers/MarkedHelper"
import useFeatureFlag from "../../hooks/useFeatureFlag"
import {
  createRecord,
  getRecordById,
  updateRecord,
} from "../../redux/slices/records"
import HugeRTEEditor from "../editors/hugeRTE.editor"
import DiscardModal from "../modals/DiscardModal"
import LatexRenderer from "../renderers/LatexRenderer"
import MarkJsRenderer from "../renderers/MarkedJsRenderer"
import MermaidRenderer from "../renderers/MermaidRenderer"
import PlantUMLRenderer from "../renderers/PlantUmlRenderer"

const AddQuillModal = ({
  position,
  onClose,
  elementId,
  fetchData,
  onSuccess,
  actionType,
  text,
  submitText,
  cancelText,
  recordId,
  elementValue,
}) => {
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const [initialData, setInitialData] = useState({
    quilleditor: "",
    vscode: "",
    tags: [],
  })
  const [hasChanges, setHasChanges] = useState(false)
  const [tags, setTags] = useState([])
  const canTags = useFeatureFlag("Record Tagging")
  const [discardModalVisible, setDiscardModalVisible] = useState(false)
  const [pendingDiscard, setPendingDiscard] = useState(null)
  const [quillContent, setQuillContent] = useState("")
  const [mermaidCodeContent, setMermaidCodeContent] = useState("")
  const [mermaidSvg, setMermaidSvg] = useState("")
  const [plantUmlSvg, setPlantUmlSvg] = useState("")
  const [latexSvg, setLatexSvg] = useState("")
  const [markedJsContent, setMarkedJsContent] = useState("")
  const [plantUmlContent, setPlantUmlContent] = useState("")
  const [latexContent, setLatexContent] = useState("")
  const [editor, setEditor] = useState("quilleditor")
  const [renderer, setRenderer] = useState("mermaid")

  const handleFeatureClick = (canAccess, action) => {
    if (canAccess) {
      action()
    } else {
      navigate(`?plan=upgrade-to-premium`)
    }
  }

  const fetchRecordData = useCallback(async () => {
    if (actionType === "edit" && recordId) {
      try {
        const record = await dispatch(getRecordById(recordId)).unwrap()
        if (record) {
          const { content, editorType } = record.metadata

          // Set content state
          setQuillContent(editorType === "quilleditor" ? content : "")
          setMermaidCodeContent(editorType === "vscode" ? content : "")
          setMarkedJsContent(editorType === "markeddown" ? content : "")
          setPlantUmlContent(editorType === "plantuml" ? content : "")
          setLatexContent(editorType === "latex" ? content : "")

          // Set tag and initial data
          setTags(record.tags || [])
          setInitialData({
            quilleditor: editorType === "quilleditor" ? content : "",
            vscode: editorType === "vscode" ? content : "",
            markedjs: editorType === "markeddown" ? content : "",
            plantuml: editorType === "plantuml" ? content : "",
            latex: editorType === "latex" ? content : "",
            tags: record.tags || [],
          })

          if (editorType === "quilleditor") {
            setEditor("quilleditor")
            setRenderer("")
          } else if (
            editorType === "vscode" ||
            editorType === "markeddown" ||
            editorType === "plantuml" ||
            editorType === "latex"
          ) {
            setEditor("vscode")
            if (editorType === "markeddown") {
              setRenderer("markeddown")
            } else if (editorType === "plantuml") {
              setRenderer("plantuml")
            } else if (editorType === "latex") {
              setRenderer("latex")
            } else {
              setRenderer("mermaid")
            }
          } else {
            setEditor("quilleditor")
            setRenderer("")
          }
        }
      } catch (error) {
        cogoToast.error(`Failed to fetch record: ${error.message}`)
      }
    }
  }, [actionType, recordId, dispatch])

  useEffect(() => {
    fetchRecordData()
  }, [fetchRecordData])

  useEffect(() => {
    let currentContent = ""
    let initialContent = ""

    if (editor === "quilleditor") {
      currentContent = quillContent
      initialContent = initialData.quilleditor || ""
    } else if (renderer === "mermaid") {
      currentContent = mermaidCodeContent
      initialContent = initialData.vscode || ""
    } else if (renderer === "plantuml") {
      currentContent = plantUmlContent
      initialContent = initialData.plantuml || ""
    } else if (renderer === "latex") {
      currentContent = latexContent
      initialContent = initialData.latex || ""
    } else {
      currentContent = markedJsContent
      initialContent = initialData.markeddown || ""
    }

    if (!currentContent) {
      setHasChanges(false)
      return
    }

    const metadataChanged = currentContent !== initialContent
    const tagsChanged =
      JSON.stringify(tags) !== JSON.stringify(initialData.tags)

    setHasChanges(metadataChanged || tagsChanged)
  }, [
    quillContent,
    mermaidCodeContent,
    markedJsContent,
    plantUmlContent,
    latexContent,
    tags,
    initialData,
    editor,
    renderer,
  ])

  const getMarkedPreviewHtml = markdown => {
    const rawHtml = marked.parse(markdown || "")
    const sanitizedHtml = DOMPurify.sanitize(rawHtml)
    return sanitizedHtml
  }

  const handleEditorChange = newEditor => {
    const hasContentOrTags =
      quillContent.trim() ||
      mermaidCodeContent.trim() ||
      markedJsContent.trim() ||
      plantUmlContent.trim() ||
      latexContent.trim()
    // tags.length > 0

    if (hasContentOrTags) {
      setPendingDiscard({ type: "main", value: newEditor })
      setDiscardModalVisible(true)
    } else {
      setEditor(newEditor)
      resetEditorStates()
    }
  }

  const handleRendererChange = newRenderer => {
    const hasContentOrTags =
      mermaidCodeContent.trim() ||
      markedJsContent.trim() ||
      plantUmlContent.trim() ||
      latexContent.trim()
    // tags.length > 0

    if (hasContentOrTags) {
      setPendingDiscard({ type: "sub", value: newRenderer })
      setDiscardModalVisible(true)
    } else {
      setRenderer(newRenderer)
      resetEditorStates()
    }
  }

  const resetEditorStates = () => {
    setQuillContent("")
    setMermaidCodeContent("")
    setMarkedJsContent("")
    setPlantUmlContent("")
    setLatexContent("")
    setMermaidSvg("")
    setPlantUmlSvg("")
    setLatexSvg("")
  }

  const confirmDiscard = () => {
    resetEditorStates()
    if (pendingDiscard?.type === "main") {
      setEditor(pendingDiscard.value)
      if (pendingDiscard.value === "vscode") setRenderer("mermaid")
    } else if (pendingDiscard?.type === "sub") {
      setRenderer(pendingDiscard.value)
    }
    setDiscardModalVisible(false)
    setPendingDiscard(null)
  }

  const handleSave = async () => {
    const editorType =
      editor === "quilleditor"
        ? "quilleditor"
        : renderer === "mermaid"
        ? "vscode"
        : renderer === "plantuml"
        ? "plantuml"
        : renderer === "latex"
        ? "latex"
        : "markeddown"

    const currentContent =
      editor === "quilleditor"
        ? quillContent
        : renderer === "mermaid"
        ? mermaidCodeContent
        : renderer === "plantuml"
        ? plantUmlContent
        : renderer === "latex"
        ? latexContent
        : markedJsContent

    if (!currentContent?.trim()) {
      cogoToast.error("Metadata is required!")
      return
    }

    if (
      tags.length > 0 &&
      tags.some(tag => !tag.key.trim() || !tag.value.trim())
    ) {
      cogoToast.error("Each tag must have both a key and a value.")
      return
    }

    const parsedMetadata = { content: currentContent, editorType }
    const previewContent =
      editorType === "markeddown"
        ? getMarkedPreviewHtml(markedJsContent)
        : currentContent
    const createRecordDto = {
      metadata: parsedMetadata,
      tags,
      recordSvg:
        renderer === "mermaid"
          ? mermaidSvg
          : renderer === "plantuml"
          ? plantUmlSvg
          : renderer === "latex"
          ? latexSvg
          : renderer === "markeddown"
          ? previewContent
          : undefined,
    }

    try {
      setIsLoading(true)

      if (actionType === "edit") {
        const updateRecordDto = {
          metadata: parsedMetadata,
          tags,
          recordSvg:
            renderer === "mermaid"
              ? mermaidSvg
              : renderer === "plantuml"
              ? plantUmlSvg
              : renderer === "latex"
              ? latexSvg
              : renderer === "markeddown"
              ? previewContent
              : undefined,
        }
        await dispatch(updateRecord({ recordId, updateRecordDto })).unwrap()
        cogoToast.success("Record updated successfully!")
        await dispatch(getRecordById(recordId)).unwrap()
      } else if (actionType === "add") {
        const response = await dispatch(
          createRecord({ elementId, createRecordDto })
        ).unwrap()
        await dispatch(getRecordById(response.recordId)).unwrap()
        cogoToast.success("Record added successfully!")
      }

      onClose()
      onSuccess()
      fetchData()
    } catch (error) {
      cogoToast.error(`Error adding record: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const cancelDiscard = () => {
    setDiscardModalVisible(false)
    setPendingDiscard(null)
  }

  const addTag = () => {
    setTags(prev => [...prev, { key: "", value: "", id: Date.now() }])
  }

  const handleTagChange = (id, field, value) => {
    setTags(prev =>
      prev.map(tag => (tag.id === id ? { ...tag, [field]: value } : tag))
    )
  }

  const deleteTag = id => {
    setTags(prev => prev.filter(tag => tag.id !== id))
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50"></div>

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          left: position.x,
          top: position.y,
          transform: "translate(-50%, -50%)",
        }}
        className={`bg-white border border-gray-300 rounded-lg shadow-lg z-50 ${
          editor === "vscode" ? "w-[1300px]" : "w-[950px]"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-t-lg border-b border-gray-300">
          <h2 className="text-xl font-semibold text-gray-800">{text} Record</h2>
          <button
            className="text-gray-500 hover:text-gray-700 text-"
            onClick={onClose}
          >
            ✖
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 overflow-y-auto">
          <div className="flex justify-between items-center">
            <label className="text-xl font-medium text-gray-700">
              {elementValue}
            </label>

            <div className="flex gap-3 items-center">
              <label className="flex items-center text-gray-700 text-sm">
                <span className="mr-2 text-gray-600 font-medium text-base whitespace-nowrap">
                  Select Editor:
                </span>
                <select
                  value={editor}
                  onChange={e => handleEditorChange(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1"
                >
                  <option value="quilleditor">HugeRTE</option>
                  <option value="vscode">VSCode</option>
                </select>
              </label>

              {editor === "vscode" && (
                <label className="flex items-center text-gray-700 text-sm">
                  <span className="mr-2 text-gray-600 font-medium text-base whitespace-nowrap">
                    Select Renderer:
                  </span>
                  <select
                    value={renderer}
                    onChange={e => handleRendererChange(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="mermaid">Mermaid</option>
                    <option value="plantuml">PlantUML</option>
                    <option value="markeddown">MarkedJS</option>
                    <option value="latex">LaTex</option>
                  </select>
                </label>
              )}
            </div>
          </div>

          <div>
            {editor === "quilleditor" && (
              <HugeRTEEditor
                content={quillContent}
                onEditorChange={setQuillContent}
                editorClassName={"h-[400px] mb-[50px]"}
              />
            )}

            {editor === "vscode" && renderer === "mermaid" && (
              <MermaidRenderer
                content={mermaidCodeContent}
                onEditorChange={setMermaidCodeContent}
                onSvgChange={setMermaidSvg}
              />
            )}

            {editor === "vscode" && renderer === "plantuml" && (
              <PlantUMLRenderer
                content={plantUmlContent}
                onEditorChange={setPlantUmlContent}
                onSvgChange={setPlantUmlSvg}
              />
            )}
            {editor === "vscode" && renderer === "latex" && (
              <LatexRenderer
                content={latexContent}
                onEditorChange={setLatexContent}
                onSvgChange={setLatexSvg}
              />
            )}
            {editor === "vscode" && renderer === "markeddown" && (
              <MarkJsRenderer
                content={markedJsContent}
                onEditorChange={setMarkedJsContent}
              />
            )}
          </div>
          {/* Add Tags Button with Icon */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <button
                onClick={() => handleFeatureClick(canTags, addTag)}
                className="px-4 py-2 text-white bg-custom-main rounded-md hover:bg-custom-secondary focus:outline-none flex items-center"
              >
                <BsTags className="h-5 w-5 mr-2" /> Add Tags
              </button>
            </div>
          </div>

          {/* Tags Section */}
          {tags?.length > 0 && (
            <div className="mt-4">
              <div className="max-h-28 overflow-y-auto pr-3">
                {tags?.map(tag => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between mt-2"
                  >
                    {/* Key Input */}
                    <div className="flex flex-col w-60 space-y-1">
                      <label
                        htmlFor={`key-${tag.id}`}
                        className="text-sm text-gray-600"
                      >
                        Key
                      </label>
                      <input
                        id={`key-${tag?.id}`}
                        type="text"
                        placeholder="Key"
                        value={tag.key}
                        onChange={e =>
                          handleTagChange(tag.id, "key", e?.target?.value)
                        }
                        className="border-2 border-gray-300 rounded-md p-2 focus:border-custom-main focus:outline-none"
                      />
                    </div>

                    {/* Value Input */}
                    <div className="flex flex-col w-60 space-y-1">
                      <label
                        htmlFor={`value-${tag?.id}`}
                        className="text-sm text-gray-600"
                      >
                        Value
                      </label>
                      <input
                        id={`value-${tag.id}`}
                        type="text"
                        placeholder="Value"
                        value={tag.value}
                        onChange={e =>
                          handleTagChange(tag.id, "value", e?.target?.value)
                        }
                        className="border-2 border-gray-300 rounded-md p-2 focus:border-custom-main focus:outline-none"
                      />
                    </div>

                    {/* Delete Icon */}
                    <button
                      onClick={() => deleteTag(tag?.id)}
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-custom-main text-white hover:bg-custom-main-dark"
                    >
                      <IoTrash className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end bg-gray-100 px-4 py-2 rounded-b-lg border-t border-gray-300 space-x-3">
          <button
            onClick={onClose}
            className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || isLoading}
            className={`py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg ${
              hasChanges
                ? "bg-custom-main text-white hover:bg-custom-secondary"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isLoading ? "Loading..." : submitText}
          </button>
        </div>
      </div>
      {discardModalVisible && (
        <DiscardModal
          isOpen={discardModalVisible}
          title={"Editor Content?"}
          onClose={cancelDiscard}
          onConfirm={confirmDiscard}
        />
      )}
    </>
  )
}

export default AddQuillModal
