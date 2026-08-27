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
    "inline-flex items-center font-mono font-medium rounded uppercase tracking-wider select-none";

  const sizeStyles = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
  };

  const variantStyles = {
    gold: "bg-aviation-gold/15 text-aviation-gold-light border border-aviation-gold/30",
    blue: "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30",
    emerald: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    amber: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
    rose: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
    slate: "bg-slate-800 text-slate-300 border border-slate-700",
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {icon}
      {children}
    </span>
  );
};
