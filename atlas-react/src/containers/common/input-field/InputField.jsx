import React from "react"

const InputField = ({
  type = "text",
  label,
  name,
  value,
  onChange,
  placeholder,
}) => {
  return (
    <div className="p-4">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="py-3 px-4 block w-full border-2 border-gray-300 rounded-lg text-sm focus:border-custom-main focus:ring-0 dark:bg-neutral-900 dark:border-neutral-700 dark:placeholder-neutral-500 dark:text-neutral-400"
        placeholder={placeholder}
      />
    </div>
  )
}

export default InputField
