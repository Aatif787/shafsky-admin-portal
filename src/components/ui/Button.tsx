import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-aviation-950 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2 gap-2",
    lg: "text-base px-5 py-2.5 gap-2.5",
  };

  const variantStyles = {
    primary:
      "bg-aviation-gold text-aviation-950 hover:bg-amber-400 focus:ring-aviation-gold active:bg-amber-500 font-semibold shadow-sm shadow-aviation-gold/20",
    secondary:
      "bg-aviation-800 text-slate-200 hover:bg-aviation-700 hover:text-white border border-aviation-700/60 focus:ring-aviation-600",
    outline:
      "bg-transparent text-slate-300 hover:text-white border border-aviation-700 hover:border-slate-500 focus:ring-slate-500",
    danger:
      "bg-red-600 text-white hover:bg-red-500 focus:ring-red-500 active:bg-red-700 shadow-sm shadow-red-600/20",
    ghost:
      "bg-transparent text-slate-400 hover:text-slate-100 hover:bg-aviation-850 focus:ring-aviation-700",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-current" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
