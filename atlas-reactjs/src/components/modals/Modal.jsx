import React, { useEffect, useRef } from "react";
import Icons from "../../constants/icons";

const ModalComponent = ({
  isOpen,
  onClose,
  title,
  children,
  loading,
  onSubmit,
  submitText = "Submit",
  cancelText = "Cancel",
  showBottomButton = false,
  onImportAsJSON,
  disabled = false,
}) => {
  const focusRef = useRef(null);

  useEffect(() => {
    if (isOpen && focusRef.current) {
      focusRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Background Overlay */}
      <div className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black/50" />

      {/* Modal Container */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 sm:max-w-lg w-full m-3 sm:mx-auto">
        <div className="w-full flex flex-col bg-white border shadow-lg rounded-xl">
          {/* Modal Header */}
          <div className="flex justify-between items-center py-3 px-4 border-b">
            <h3 className="text-xl font-semibold text-gray-800">{title}</h3>


            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              ✖
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-2">
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, { ref: focusRef });
              }
              return child || null;
            })}
          </div>

          {/* Modal Footer (Only show when onSubmit is provided) */}
          {onSubmit && (
            <div className="flex justify-between py-3 px-4 items-center">
              <div>
                {showBottomButton && (
                  <button
                    onClick={onImportAsJSON}
                    className="text-blue-500 hover:underline cursor-pointer text-sm"
                  >
                    Import from JSON
                  </button>
                )}
              </div>
              <div className="flex gap-x-2 ml-auto">
                <button
                  type="button"
                  className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                  onClick={onClose}
                >
                  {cancelText}
                </button>
                {loading ? (
                  <button
                    type="button"
                    disabled
                    className="py-3 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-custom-main text-white opacity-50 cursor-not-allowed"
                  >
                    <Icons.LoadingIcon />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onSubmit}
                    disabled={disabled}
                    className={`py-3 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent text-white focus:outline-none
            ${
              disabled
                ? "bg-custom-main cursor-not-allowed opacity-50"
                : "bg-custom-main hover:bg-red-800"
            }
          `}
                  >
                    {submitText}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prevent Scrolling */}
      <style>{`
        body {
          overflow: hidden;
        }
      `}</style>
    </>
  );
};

export default ModalComponent;
