import React, { forwardRef } from "react";

const TextArea = forwardRef(
  (
    {
      value,
      onChange,
      placeholder = "",
      rows = 4,
      cols = 50,
      disabled = false,
      maxLength,
      id,
      name,
      className = "",
      errorMessage,
      label,
      required = false,
    },
    ref
  ) => {
    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
            {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          cols={cols}
          disabled={disabled}
          maxLength={maxLength}
          className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ease-in-out ${
            disabled ? "bg-gray-200" : "bg-white"
          } ${
            errorMessage ? "border-red-500" : "border-gray-300"
          } ${className}`}
        />
        {errorMessage && (
          <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
        )}
      </div>
    );
  }
);

export default TextArea;
