import React from "react";

type InputProps = {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
};

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-1">{label}</label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
};

export default Input;
