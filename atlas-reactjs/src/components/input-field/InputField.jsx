import React from "react";

const InputField = React.forwardRef(
  (
    {
      type = "text",
      label,
      name,
      value,
      onChange,
      placeholder,
      onKeyDown,
      className,
    },
    ref
  ) => {
    return (
      <div className="p-0">
        {label && (
          <label htmlFor={name} className="block text-sm font-medium mb-2">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          id={name}
          name={name}
          onKeyDown={onKeyDown}
          value={value}
          onChange={onChange}
          className={`py-3 px-4 block w-full border-2 border-gray-300 rounded-lg text-sm focus:border-custom-main focus:outline-none dark:bg-neutral-900 dark:border-neutral-700 dark:placeholder-neutral-500 dark:text-neutral-400 ${className}`}
          placeholder={placeholder}
        />
      </div>
    );
  }
);

export default InputField;
