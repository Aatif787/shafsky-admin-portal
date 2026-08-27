import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  PlaneTakeoff,
  Plane,
  CreditCard,
  Radio,
  Users,
  ShieldCheck,
  X,
} from "lucide-react";
import { useAuth } from "../../auth/useAuth";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const navigationItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      name: "Bookings",
      path: "/bookings",
      icon: <PlaneTakeoff className="h-4 w-4" />,
    },
    {
      name: "Charter Desk",
      path: "/charter",
      icon: <Plane className="h-4 w-4" />,
    },
    {
      name: "Payments",
      path: "/payments",
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      name: "Operations",
      path: "/operations",
      icon: <Radio className="h-4 w-4" />,
    },
  ];

  const adminOnlyItems = isSuperAdmin
    ? [
        {
          name: "Team & Roles",
          path: "/team",
          icon: <Users className="h-4 w-4" />,
        },
      ]
    : [];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col bg-aviation-900 border-r border-aviation-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-aviation-800">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-aviation-gold/10 border border-aviation-gold/30">
              <ShieldCheck className="h-5 w-5 text-aviation-gold" />
            </div>
            <div>
              <span className="block font-display font-bold text-sm tracking-wider text-white uppercase">
                Shafsky
              </span>
              <span className="block text-[10px] font-mono tracking-widest text-aviation-gold uppercase">
                Operations Portal
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-aviation-800 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <div className="px-3 mb-2 text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-500">
              Operations
            </div>
            <nav className="space-y-1">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={() => onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-aviation-gold text-aviation-950 font-semibold shadow-sm shadow-aviation-gold/20"
                        : "text-slate-300 hover:bg-aviation-800/80 hover:text-white"
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {adminOnlyItems.length > 0 && (
            <div>
              <div className="px-3 mb-2 text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-500">
                Administration
              </div>
              <nav className="space-y-1">
                {adminOnlyItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => onClose()}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                        isActive
                          ? "bg-aviation-gold text-aviation-950 font-semibold shadow-sm shadow-aviation-gold/20"
                          : "text-slate-300 hover:bg-aviation-800/80 hover:text-white"
                      }`
                    }
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          )}
        </div>

        {/* Operational Footer Status */}
        <div className="p-4 border-t border-aviation-800 bg-aviation-950/50">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">Environment</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Online
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>Engine</span>
            <span>FastAPI 2.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};
