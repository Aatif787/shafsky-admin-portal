import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "gold" | "blue" | "emerald" | "amber" | "rose" | "slate";
  size?: "sm" | "md";
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "gold",
  size = "md",
  className = "",
  icon,
}) => {
  const baseStyles =
    "inline-flex items-center font-mono font-medium rounded-md uppercase tracking-wider select-none";

  const sizeStyles = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
  };

  const variantStyles = {
    gold: "bg-lime-50 text-lime-700 border border-lime-200",
    blue: "bg-sky-50 text-sky-700 border border-sky-200",
    emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    amber: "bg-orange-50 text-orange-700 border border-orange-200",
    rose: "bg-rose-50 text-rose-700 border border-rose-200",
    slate: "bg-slate-100 text-slate-600 border border-slate-200",
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {icon}
      {children}
    </span>
  );
};
