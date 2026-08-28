import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { buildApiUrl } from "../../api/config";

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backendLive, setBackendLive] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    const ping = async () => {
      try {
        const res = await fetch(buildApiUrl("/api/health"), {
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        if (!cancelled) setBackendLive(res.ok);
      } catch {
        if (!cancelled) setBackendLive(false);
      }
    };
    ping();
    const id = window.setInterval(ping, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return (
    <div className="min-h-screen bg-aviation-950 flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        backendLive={backendLive}
      />
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[248px]">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
