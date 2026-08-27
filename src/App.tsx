import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AdminLayout } from "./components/layout/AdminLayout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { ComingSoon } from "./pages/ComingSoon";
import { AccessDenied } from "./pages/AccessDenied";
import { NotFound } from "./pages/NotFound";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/access-denied" element={<AccessDenied />} />

        {/* Protected Admin Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/bookings" element={<ComingSoon moduleName="Airport Bookings Desk" phaseNumber="Phase 18" />} />
          <Route path="/charter" element={<ComingSoon moduleName="Private Charter Desk" phaseNumber="Phase 18" />} />
          <Route path="/payments" element={<ComingSoon moduleName="Payment Ledger" phaseNumber="Phase 19" />} />
          <Route path="/operations" element={<ComingSoon moduleName="Operations Queue" phaseNumber="Phase 20" />} />
          
          {/* Super Admin Restricted Route */}
          <Route
            path="/team"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <ComingSoon moduleName="Team & Roles" phaseNumber="Phase 21" />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
