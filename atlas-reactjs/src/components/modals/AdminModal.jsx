import { useEffect } from "react";
import React from "react";

const Modal = ({ isOpen, onClose, children, className = "" }) => {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 h-screen m-0 left-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 h-full w-full "></div>
      <div>{children}</div>
    </div>
  );
};

export default Modal;
