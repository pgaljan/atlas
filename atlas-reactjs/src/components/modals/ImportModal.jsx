import React, { useState } from "react"
import cogoToast from "@successtar/cogo-toast"
import { GoCheck, GoCopy } from "react-icons/go"
import Tooltip from "../tooltip/Tooltip"
import { sampleData } from "../../constants"

const ImportModal = ({
  isOpen,
  onClose,
  title,
  format,
  handleFileSelection,
  buttonText,
  isLoading,
  showDownloadSample = false,
}) => {
  const [dragging, setDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [selectedFormat, setSelectedFormat] = useState("")
  const [copied, setCopied] = useState(false)

  const handleFormatChange = e => {
    setSelectedFormat(e.target.value)
  }

  const allowedExtensions = format
    .split(",")
    .map(ext => ext?.trim()?.replace(".", ""))
  const handleDragOver = e => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = e => {
    e.preventDefault()
    setDragging(false)
  }

  const handleDrop = e => {
    e.preventDefault()
    setDragging(false)

    const file = e.dataTransfer?.files[0]
    validateFile(file)
  }

  const handleFileSelect = e => {
    const file = e.target?.files[0]
    validateFile(file)
  }

  const validateFile = file => {
    const fileExtension = file?.name?.split(".")?.pop()?.toLowerCase()
    if (file && allowedExtensions?.includes(fileExtension)) {
      setSelectedFile(file)
      setErrorMessage("")
    } else {
      setErrorMessage(
        `Only ${format} files are allowed. Please upload a valid file.`
      )
      setSelectedFile(null)
    }
  }
  const handleConfirmUpload = () => {
    if (selectedFile) {
      handleFileSelection(selectedFile)
      setSelectedFile(null)
      onClose()
    } else {
      setErrorMessage("No file selected!")
    }
  }

  const fallbackCopy = text => {
    const textarea = document.createElement("textarea")
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    const success = document.execCommand("copy")
    document.body.removeChild(textarea)

    success
      ? cogoToast.success("Data copied to clipboard!")
      : cogoToast.error("Failed to copy data")
  }

  const copyToClipboard = async (data, format) => {
    let formattedData = data
    if (format === "xlsx") {
      formattedData = data.replace(/,/g, "\t")
    } else if (format === "csv") {
      formattedData = data
        .split("\n")
        .map(row =>
          row
            .split(",")
            .map(value => `"${value.trim()}"`)
            .join(",")
        )
        .join("\n")
    } else if (format === "json") {
      formattedData = JSON.stringify(JSON.parse(data), null, 2)
    }

    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(formattedData)
        return cogoToast.success(
          `${format.toUpperCase()} data copied to clipboard!`
        )
      } catch {
        fallbackCopy(formattedData)
      }
    } else {
      fallbackCopy(formattedData)
    }
  }

  const handleCopy = () => {
    if (selectedFormat) {
      copyToClipboard(sampleData[selectedFormat], selectedFormat)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isOpen) return null
  const handleCancel = () => {
    setSelectedFile(null)
    setErrorMessage("")
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        {selectedFile ? (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">
              Confirm Upload
            </h2>
            <p className="text-center text-gray-600 font-medium mb-4">
              {selectedFile?.name}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="bg-custom-main text-white px-4 py-2 rounded"
                onClick={handleConfirmUpload}
              >
                {isLoading ? "Loading..." : buttonText}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center pb-4 ">
              <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={onClose}
              >
                ✖
              </button>
            </div>
            <div
              className={`w-full h-48 border-2 ${
                dragging ? "border-blue-400" : "border-gray-300"
              } border-dashed rounded-lg flex flex-col justify-center items-center bg-gray-50 hover:bg-gray-100 cursor-pointer`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-16 h-16 mb-4 text-custom-main"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v4a2 2 0 002 2h12a2 2 0 002-2v-4M16 12l-4-4m0 0l-4 4m4-4v12"
                />
              </svg>
              <p className="text-gray-600 font-medium">
                {dragging
                  ? "Drop files here"
                  : `Drag & drop your ${format} file here`}
              </p>
              <p className="text-sm text-gray-400 mt-1 text-center">
                Supported format:{" "}
                <span className="font-medium text-gray-600">{format}</span>
              </p>
            </div>
            <div className="mt-4 flex flex-col items-center">
              <label
                htmlFor="file-input"
                className="text-blue-500 underline cursor-pointer mb-2"
              >
                or browse files
              </label>
              <input
                id="file-input"
                type="file"
                accept={format}
                onChange={handleFileSelect}
                className="hidden"
              />

              {showDownloadSample && (
                <>
                  <select
                    onChange={handleFormatChange}
                    className="mt-2 p-3 border border-gray-300  bg-white rounded-lg w-full"
                  >
                    <option value="" disabled selected>
                      Sample format
                    </option>
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                    <option value="xlsx">XLSX</option>
                  </select>

                  {selectedFormat && (
                    <div className="mt-4 p-3 border border-gray-300 rounded w-full max-h-40 overflow-auto">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold">
                          Sample {selectedFormat.toUpperCase()} Data:
                        </h3>
                        <Tooltip
                          label={copied ? "Copied" : "Copy"}
                          position="bottom"
                          customPosition="top-full mt-2 left-1/5 transform -translate-x-1/2"
                        >
                          <button
                            className="text-gray-500 hover:text-red-600 transition-all flex items-center"
                            onClick={handleCopy}
                          >
                            {copied ? (
                              <GoCheck className="w-5 h-5 text-custom-main font-bold" />
                            ) : (
                              <GoCopy className="w-5 h-5 text-gray-600 font-bold hover:text-red-800" />
                            )}
                          </button>
                        </Tooltip>
                      </div>

                      <pre className="text-xs text-gray-700 mt-2 whitespace-pre-wrap break-words overflow-x-auto max-w-full cursor-text select-text">
                        {sampleData[selectedFormat]}
                      </pre>
                    </div>
                  )}

                  <div className="flex items-center w-[250px] mt-4 ">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="px-2 text-gray-500 text-sm">OR</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                  </div>
                  <a
                    href="/sample_data.zip"
                    download="sample_data.zip"
                    className="mt-2 text-blue-500 underline cursor-pointer"
                  >
                    download samples
                  </a>
                </>
              )}
            </div>

            {errorMessage && (
              <p className="mt-4 text-red-500">
                <strong>Error:</strong> {errorMessage}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ImportModal
