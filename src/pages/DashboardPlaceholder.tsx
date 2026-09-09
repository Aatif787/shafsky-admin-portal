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
      title: "Airport & Service Bookings",
      description: "Airport assistance plus hotel, transport, medical, and travel enquiries.",
      icon: <PlaneTakeoff className="h-6 w-6 text-lime-600" />,
      path: "/bookings",
      badge: "Bookings Desk",
    },
    {
      title: "Private Charter Desk",
      description: "Corporate and private jet charter quotation requests (SC- references).",
      icon: <Plane className="h-6 w-6 text-orange-500" />,
      path: "/charter",
      badge: "Charter Desk",
    },
    {
      title: "Payment Ledger",
      description: "Monitor Razorpay payment transactions, reconciliations, and refunds.",
      icon: <CreditCard className="h-6 w-6 text-sky-600" />,
      path: "/payments",
      badge: "Settlements",
    },
    {
      title: "Operations Queue",
      description: "Live ground handling dispatch, flight status, and internal notes.",
      icon: <Radio className="h-6 w-6 text-emerald-600" />,
      path: "/operations",
      badge: "Live Ops",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-lime-500/5 via-orange-500/5 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange-600">
                Operations Desk
              </span>
              <Badge variant={isSuperAdmin ? "amber" : "blue"} size="sm">
                {role || "ADMIN"}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
              Welcome back, {user?.fullName || user?.email?.split("@")[0] || "Operator"}
            </h1>
            <p className="text-sm text-slate-500 max-w-xl">
              Shafsky Aviation Concierge platform is active. Authenticated session verified with asymmetric JWT security.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left shadow-2xs">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Operator Account</div>
              <div className="text-xs font-semibold text-slate-900 font-mono">{user?.email}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left shadow-2xs">
              <div className="text-[10px] font-mono text-slate-400 uppercase">API Status</div>
              <div className="text-xs font-semibold text-lime-700 flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="h-3.5 w-3.5 text-lime-600" />
                Live & Connected
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Operations Quick Overview */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-display font-semibold text-slate-900">Workspaces</h2>
          <p className="text-xs text-slate-500">
            Quick shortcuts to manage bookings, charter inquiries, and daily airport operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((mod) => (
            <Link
              key={mod.path}
              to={mod.path}
              className="group rounded-xl border border-slate-200 bg-white p-5 hover:border-lime-500 hover:shadow-md transition-all duration-200 shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 group-hover:border-lime-400 group-hover:bg-lime-50/50 transition">
                  {mod.icon}
                </div>
                <Badge variant="slate" size="sm">
                  {mod.badge}
                </Badge>
              </div>
              <div className="mt-4">
                <h3 className="text-base font-semibold text-slate-900 group-hover:text-lime-700 transition">
                  {mod.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  {mod.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* System Invariant Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-700 uppercase">
          <Activity className="h-4 w-4 text-orange-500" />
          Production Core Invariants Active
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono text-slate-600">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="block text-slate-400 text-[10px]">SECURITY LEVEL</span>
            <span className="text-slate-900 font-semibold">RS256 Asymmetric JWT</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="block text-slate-400 text-[10px]">CREDENTIAL STORE</span>
            <span className="text-slate-900 font-semibold">HttpOnly Cookie + In-Memory</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="block text-slate-400 text-[10px]">BOOKING CUTOFFS</span>
            <span className="text-slate-900 font-semibold">12h Domestic / 24h Intl</span>
          </div>
        </div>
      </div>
    </div>
  );
};
