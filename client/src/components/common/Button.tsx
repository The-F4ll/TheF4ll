import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "danger";
  fullWidth?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  fullWidth = false,
  disabled = false,
  type = "button",
  onClick,
}) => {
  const baseClasses =
    "px-6 py-3 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2";

  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-400",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-400",
    success: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-400",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-400",
  };

  const widthClasses = fullWidth ? "w-full" : "";

  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${widthClasses} ${disabledClasses}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
