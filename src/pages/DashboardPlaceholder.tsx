import React from "react";
import { Link } from "react-router-dom";
import {
  PlaneTakeoff,
  Plane,
  CreditCard,
  Radio,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../auth/useAuth";
import { Badge } from "../components/ui/Badge";

export const DashboardPlaceholder: React.FC = () => {
  const { user, role } = useAuth();
  const isSuperAdmin = role === "SUPER_ADMIN";

  const modules = [
    {
      title: "Airport Bookings",
      description: "Manage Meet & Assist arrivals, departures, and transit bookings.",
      icon: <PlaneTakeoff className="h-6 w-6 text-aviation-gold" />,
      path: "/bookings",
      badge: "Phase 17",
    },
    {
      title: "Private Charter Desk",
      description: "Review tailored jet charter requests, itineraries, and quotations.",
      icon: <Plane className="h-6 w-6 text-cyan-400" />,
      path: "/charter",
      badge: "Phase 18",
    },
    {
      title: "Payment Ledger",
      description: "Monitor Razorpay payment transactions, reconciliations, and refunds.",
      icon: <CreditCard className="h-6 w-6 text-emerald-400" />,
      path: "/payments",
      badge: "Phase 19",
    },
    {
      title: "Operations Queue",
      description: "Live ground handling dispatch, flight status, and internal notes.",
      icon: <Radio className="h-6 w-6 text-amber-400" />,
      path: "/operations",
      badge: "Phase 20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-aviation-800 bg-aviation-900/60 p-6 sm:p-8 backdrop-blur-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-aviation-gold/5 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-aviation-gold">
                Operations Desk
              </span>
              <Badge variant={isSuperAdmin ? "gold" : "blue"} size="sm">
                {role || "ADMIN"}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
              Welcome back, {user?.fullName || user?.email?.split("@")[0] || "Operator"}
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Shafsky Aviation Concierge platform is active. Authenticated session active with RS256 token verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-aviation-700/60 bg-aviation-850 px-4 py-3 text-left">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Operator Email</div>
              <div className="text-xs font-semibold text-white font-mono">{user?.email}</div>
            </div>
            <div className="rounded-xl border border-aviation-700/60 bg-aviation-850 px-4 py-3 text-left">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Backend Status</div>
              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Connected
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Operations Quick Overview */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-display font-semibold text-white">Portal Modules</h2>
          <p className="text-xs text-slate-400">
            Dedicated operational workspaces for your daily booking management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((mod) => (
            <Link
              key={mod.path}
              to={mod.path}
              className="group rounded-xl border border-aviation-800 bg-aviation-900/40 p-5 hover:bg-aviation-850/80 hover:border-aviation-700 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-aviation-800 border border-aviation-700 group-hover:border-aviation-gold/40 transition">
                  {mod.icon}
                </div>
                <Badge variant="slate" size="sm">
                  {mod.badge}
                </Badge>
              </div>
              <div className="mt-4">
                <h3 className="text-base font-semibold text-white group-hover:text-aviation-gold transition">
                  {mod.title}
                </h3>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  {mod.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* System Invariant Card */}
      <div className="rounded-xl border border-aviation-800 bg-aviation-900/30 p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-300 uppercase">
          <Activity className="h-4 w-4 text-aviation-gold" />
          Production Core Invariants Active
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono text-slate-400">
          <div className="p-3 rounded-lg bg-aviation-950/60 border border-aviation-850">
            <span className="block text-slate-500 text-[10px]">AUTH PROTOCOL</span>
            <span className="text-slate-200 font-semibold">RS256 Asymmetric JWT</span>
          </div>
          <div className="p-3 rounded-lg bg-aviation-950/60 border border-aviation-850">
            <span className="block text-slate-500 text-[10px]">SESSION STORAGE</span>
            <span className="text-slate-200 font-semibold">HttpOnly Cookie + In-Memory</span>
          </div>
          <div className="p-3 rounded-lg bg-aviation-950/60 border border-aviation-850">
            <span className="block text-slate-500 text-[10px]">BOOKING CUTOFFS</span>
            <span className="text-slate-200 font-semibold">12h Domestic / 24h Intl</span>
          </div>
        </div>
      </div>
    </div>
  );
};
