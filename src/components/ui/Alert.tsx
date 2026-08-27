import React from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

export interface AlertProps {
  variant?: "error" | "warning" | "success" | "info";
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = "error",
  title,
  children,
  className = "",
}) => {
  const icons = {
    error: <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />,
    success: <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />,
    info: <Info className="h-4 w-4 text-cyan-400 shrink-0" />,
  };

  const styles = {
    error: "bg-rose-950/40 border-rose-800/60 text-rose-200",
    warning: "bg-amber-950/40 border-amber-800/60 text-amber-200",
    success: "bg-emerald-950/40 border-emerald-800/60 text-emerald-200",
    info: "bg-cyan-950/40 border-cyan-800/60 text-cyan-200",
  };

  return (
    <div className={`flex gap-3 rounded-lg border p-3.5 text-xs ${styles[variant]} ${className}`}>
      {icons[variant]}
      <div className="space-y-0.5 leading-relaxed">
        {title && <div className="font-semibold">{title}</div>}
        <div>{children}</div>
      </div>
    </div>
  );
};
