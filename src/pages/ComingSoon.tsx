import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Clock, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/Button";

interface ComingSoonProps {
  moduleName?: string;
  phaseNumber?: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ moduleName, phaseNumber }) => {
  const location = useLocation();

  const getModuleInfo = () => {
    const path = location.pathname;
    if (path.includes("booking")) return { title: "Airport Bookings Desk", phase: "Phase 17" };
    if (path.includes("charter")) return { title: "Private Charter Desk", phase: "Phase 18" };
    if (path.includes("payment")) return { title: "Payment & Settlement Ledger", phase: "Phase 19" };
    if (path.includes("operation")) return { title: "Ground Handling Operations", phase: "Phase 20" };
    if (path.includes("team")) return { title: "Team & Role Administration", phase: "Phase 21" };
    return { title: moduleName || "Portal Module", phase: phaseNumber || "Upcoming" };
  };

  const info = getModuleInfo();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="max-w-md w-full rounded-2xl border border-aviation-800 bg-aviation-900/60 p-8 backdrop-blur-md space-y-6">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-aviation-800 border border-aviation-gold/30 text-aviation-gold mx-auto">
          <Clock className="h-7 w-7 animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="text-xs font-mono font-semibold uppercase tracking-widest text-aviation-gold">
            {info.phase} Target
          </div>
          <h2 className="text-xl font-display font-bold text-white">
            {info.title}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            This module is scheduled for implementation in the next phase. Authentication and core API infrastructure are verified and ready.
          </p>
        </div>

        <div className="pt-2">
          <Link to="/">
            <Button variant="secondary" size="md" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Return to Operations Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
