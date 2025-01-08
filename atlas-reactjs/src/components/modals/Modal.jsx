import React from "react"

const ModalComponent = ({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitText = "Submit",
  cancelText = "Cancel",
}) => {
  if (!isOpen) return null

  return (
    <>
      {/* Background Overlay with Reduced Blur */}
      <div className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black/50" />

      {/* Modal Container */}
      <div
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 sm:max-w-lg w-full m-3 sm:mx-auto`}
      >
        <div className="w-full flex flex-col bg-white border shadow-lg rounded-xl">
          {/* Modal Header */}
          <div className="flex justify-between items-center py-3 px-4 border-b">
            <h3 className="font-bold text-gray-800">{title}</h3>
            <button
              type="button"
              className="inline-flex justify-center items-center gap-x-2 rounded-full border border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200"
              onClick={onClose}
              aria-label="Close"
            >
              <span className="sr-only">Close</span>
              <svg
                className="shrink-0 w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-2">{children}</div>

          {/* Modal Footer */}
          <div className="flex justify-end items-center gap-x-2 py-3 px-4 ">
            <button
              type="button"
              className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
              onClick={onClose}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onSubmit}
              className="py-3 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-custom-main text-white hover:bg-custom-main focus:outline-none"
            >
              {submitText}
            </button>
          </div>
        </div>
      </div>

      {/* Prevent Scrolling */}
      <style>{`
        body {
          overflow: hidden;
        }
      `}</style>
    </>
  )
}

export default ModalComponent
