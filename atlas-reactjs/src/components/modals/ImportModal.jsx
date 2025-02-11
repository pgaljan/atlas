import React, { useState } from "react"

const ImportModal = ({
  isOpen,
  onClose,
  title,
  format,
  handleFileSelection,
  buttonText,
  isLoading,
}) => {
  const [dragging, setDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")

  const allowedExtensions = format
    .split(",")
    .map(ext => ext?.trim()?.replace(".", "")) // Extract extensions without dots
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

  // const validateFile = file => {

  //   const allowedTypes = [
  //     "application/zip",
  //     "text/csv",
  //     "application/vnd.ms-excel",
  //     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //   ]

  //   if (file && allowedTypes.includes(file.type)) {
  //     setSelectedFile(file)
  //     setErrorMessage("")
  //   } else {
  //     setErrorMessage(
  //       "Only .zip, .csv, .xls, or .xlsx files are allowed. Please upload a valid file."
  //     )
  //     setSelectedFile(null)
  //   }
  // }

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

  if (!isOpen) return null

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
                onClick={onClose}
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
            <div className="flex justify-between items-center pb-4 border-b">
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
            <div className="mt-4 flex justify-center">
              <label
                htmlFor="file-input"
                className="text-blue-500 underline cursor-pointer"
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
