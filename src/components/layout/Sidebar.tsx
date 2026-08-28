import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, ClipboardList, Plane, CreditCard, Radio, Trash2, X } from "lucide-react";
import { useAuth } from "../../auth/useAuth";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  backendLive?: boolean | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, backendLive }) => {
  const location = useLocation();
  const { role } = useAuth();
  const canManageBin = role === "ADMIN" || role === "SUPER_ADMIN";
  const navigationItems = [
    { name: "Overview", path: "/", icon: LayoutDashboard },
    { name: "Bookings", path: "/bookings", icon: ClipboardList },
    ...(canManageBin ? [{ name: "Recycle Bin", path: "/bookings/bin", icon: Trash2 }] : []),
    { name: "Charter Desk", path: "/charter", icon: Plane },
    { name: "Operations", path: "/operations", icon: Radio },
    { name: "Payments", path: "/payments", icon: CreditCard },
  ];

  const liveLabel = backendLive === false ? "Offline" : "Live";
  const liveColor = backendLive === false ? "text-rose-400" : "text-emerald-400";
  const liveDot = backendLive === false ? "bg-rose-400" : "bg-emerald-400";

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-[248px] flex-col border-r border-aviation-800 bg-aviation-900 transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-aviation-800 px-5">
          <div>
            <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
              Shafsky
            </div>
            <div className="text-sm font-semibold text-white leading-tight">
              Aviation Operations
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1.5 text-slate-400 hover:bg-aviation-800 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isBookingsRoot =
              item.path === "/bookings" &&
              location.pathname.startsWith("/bookings") &&
              !location.pathname.startsWith("/bookings/bin");
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/" || item.path === "/bookings"}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors ${
                    isActive || isBookingsRoot
                      ? "bg-aviation-800 text-white"
                      : "text-slate-400 hover:bg-aviation-850 hover:text-slate-100"
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-aviation-800 px-4 py-3 text-[11px]">
          <div className="flex items-center justify-between text-slate-500">
            <span>Environment</span>
            <span className="text-slate-300">
              {import.meta.env.DEV ? "Development" : "Production"}
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-slate-500">Status</span>
            <span className={`inline-flex items-center gap-1.5 ${liveColor}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${liveDot}`} />
              {liveLabel}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
