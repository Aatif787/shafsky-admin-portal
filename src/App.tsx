import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import {
  ADMIN_ROLES,
  RECYCLE_ADMIN_ROLES,
  STAFF_OR_ADMIN_ROLES,
} from "./auth/roles";
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
import { AirportServices } from "./pages/AirportServices";
import { ComingSoon } from "./pages/ComingSoon";
import { AccessDenied } from "./pages/AccessDenied";
import { NotFound } from "./pages/NotFound";

const adminRoles = [...ADMIN_ROLES];
const staffRoles = [...STAFF_OR_ADMIN_ROLES];
const recycleRoles = [...RECYCLE_ADMIN_ROLES];

export const App: React.FC = () => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/access-denied" element={<AccessDenied />} />

        <Route
          element={
            <ProtectedRoute allowedRoles={staffRoles}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Admin desk — bookings, charter, pricing, overview */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={adminRoles}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute allowedRoles={adminRoles}>
                <Bookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/bin"
            element={
              <ProtectedRoute allowedRoles={recycleRoles}>
                <BookingBin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/:bookingRef"
            element={
              <ProtectedRoute allowedRoles={adminRoles}>
                <BookingDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/charter"
            element={
              <ProtectedRoute allowedRoles={adminRoles}>
                <CharterDesk />
              </ProtectedRoute>
            }
          />
          <Route
            path="/charter/:id"
            element={
              <ProtectedRoute allowedRoles={adminRoles}>
                <CharterDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pricing"
            element={
              <ProtectedRoute allowedRoles={adminRoles}>
                <AirportServices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute allowedRoles={adminRoles}>
                <ComingSoon moduleName="Payment Ledger" phaseNumber="Phase 21" />
              </ProtectedRoute>
            }
          />

          {/* Ground operations — staff + admin */}
          <Route
            path="/operations"
            element={
              <ProtectedRoute allowedRoles={staffRoles}>
                <Operations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/operations/:bookingRef"
            element={
              <ProtectedRoute allowedRoles={staffRoles}>
                <OperationsDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/team"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <ComingSoon moduleName="Team & Roles" phaseNumber="Phase 22" />
              </ProtectedRoute>
            }
          />

          <Route path="/access-denied" element={<AccessDenied />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
