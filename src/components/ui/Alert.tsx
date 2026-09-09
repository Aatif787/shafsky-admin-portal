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
    error: <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />,
    warning: <AlertTriangle className="h-4 w-4 text-orange-600 shrink-0" />,
    success: <CheckCircle2 className="h-4 w-4 text-lime-600 shrink-0" />,
    info: <Info className="h-4 w-4 text-sky-600 shrink-0" />,
  };

  const styles = {
    error: "bg-rose-50 border-rose-200 text-rose-800",
    warning: "bg-orange-50 border-orange-200 text-orange-800",
    success: "bg-lime-50 border-lime-200 text-lime-800",
    info: "bg-sky-50 border-sky-200 text-sky-800",
  };

  return (
    <div className={`flex gap-3 rounded-lg border p-3.5 text-xs shadow-xs ${styles[variant]} ${className}`}>
      {icons[variant]}
      <div className="space-y-0.5 leading-relaxed">
        {title && <div className="font-semibold">{title}</div>}
        <div>{children}</div>
      </div>
    </div>
  );
};
