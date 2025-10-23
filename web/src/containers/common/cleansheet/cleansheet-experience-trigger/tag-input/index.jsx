import React, { useEffect, useRef, useState } from 'react';

const colorMap = {
  core: {
    bg: 'bg-[#e6f7e6]',
    border: 'border-[#4caf50]',
    text: 'text-[#2e7d32]',
  },
  peripheral: {
    bg: 'bg-[#e3f2fd]',
    border: 'border-[#2196f3]',
    text: 'text-[#1565c0]',
  },
  skill: {
    bg: 'bg-[#f3e5f5]',
    border: 'border-[#9c27b0]',
    text: 'text-[#6a1b9a]',
  },
  competency: {
    bg: 'bg-[#fff3e0]',
    border: 'border-[#ff9800]',
    text: 'text-[#e65100]',
  },
  project: {
    bg: 'bg-[#fce4ec]',
    border: 'border-[#e91e63]',
    text: 'text-[#ad1457]',
  },
  achievement: {
    bg: 'bg-[#e8f5e9]',
    border: 'border-[#66bb6a]',
    text: 'text-[#2e7d32]',
  },
  gray: {
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    text: 'text-gray-800',
  },
};

const TagInput = ({
  value = [],
  onChange = () => {},
  placeholder = 'Add and press Enter',
  chipColor = 'gray',
}) => {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const colors = colorMap[chipColor] || colorMap.gray;

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const addTag = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onChange([...(value || []), trimmed]);
    setInput('');
    if (inputRef.current) inputRef.current.focus();
  };

  const removeTag = (i) => {
    const next = [...(value || [])];
    next.splice(i, 1);
    onChange(next);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {(value || []).map((v, i) => (
        <span
          key={v + i}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${colors.bg} ${colors.border} ${colors.text}`}
        >
          <span className="max-w-[12rem] truncate">{v}</span>
          <button
            type="button"
            onClick={() => removeTag(i)}
            className="ml-1 text-sm opacity-70 hover:opacity-100"
          >
            ×
          </button>
        </span>
      ))}

      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border-2 border-dashed border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition"
        >
          + Add
        </button>
      )}

      {isOpen && (
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => {
            if (input.trim() === '') setIsOpen(false);
          }}
          placeholder={placeholder}
          className="px-3 py-1.5 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none min-w-[140px]"
        />
      )}
    </div>
  );
};

export default TagInput;
