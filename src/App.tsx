import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AdminLayout } from "./components/layout/AdminLayout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Bookings } from "./pages/Bookings";
import { BookingDetail } from "./pages/BookingDetail";
import { BookingBin } from "./pages/BookingBin";
import { CharterDesk } from "./pages/CharterDesk";
import { CharterDetail } from "./pages/CharterDetail";
import { Operations } from "./pages/Operations";
import { OperationsDetail } from "./pages/OperationsDetail";
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
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/bookings/bin" element={<BookingBin />} />
          <Route path="/bookings/:bookingRef" element={<BookingDetail />} />
          <Route path="/charter" element={<CharterDesk />} />
          <Route path="/charter/:id" element={<CharterDetail />} />
          <Route path="/operations" element={<Operations />} />
          <Route path="/operations/:bookingRef" element={<OperationsDetail />} />
          <Route path="/payments" element={<ComingSoon moduleName="Payment Ledger" phaseNumber="Phase 21" />} />
          
          {/* Super Admin Restricted Route */}
          <Route
            path="/team"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <ComingSoon moduleName="Team & Roles" phaseNumber="Phase 22" />
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
