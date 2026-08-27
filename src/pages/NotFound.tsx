import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";
import { Button } from "../components/ui/Button";

export const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="max-w-md w-full rounded-2xl border border-aviation-800 bg-aviation-900/60 p-8 backdrop-blur-md space-y-6">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-aviation-800 border border-aviation-gold/30 text-aviation-gold mx-auto">
          <Compass className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <div className="text-xs font-mono font-semibold uppercase tracking-widest text-aviation-gold">
            404 — Route Not Found
          </div>
          <h2 className="text-xl font-display font-bold text-white">
            Waypoint Unreachable
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The requested operations URL does not match any known portal endpoint.
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
