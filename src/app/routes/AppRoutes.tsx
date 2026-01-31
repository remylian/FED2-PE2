import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "../../pages/HomePage";
import VenuesPage from "../../pages/VenuesPage";
import VenuePage from "../../pages/VenuePage";
import LoginPage from "../../pages/LoginPage";
import RegisterPage from "../../pages/RegisterPage";
import ProfilePage from "../../pages/ProfilePage";
import MyBookingsPage from "../../pages/MyBookingsPage";
import ManagerDashboardPage from "../../pages/ManagerDashboardPage";
import NotFoundPage from "../../pages/NotFoundPage";

import RequireAuth from "../../components/auth/RequireAuth";
import RequireManager from "../../components/auth/RequireManager";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/venues" element={<VenuesPage />} />
      <Route path="/venues/:id" element={<VenuePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Auth-only */}
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        }
      />
      <Route
        path="/bookings"
        element={
          <RequireAuth>
            <MyBookingsPage />
          </RequireAuth>
        }
      />

      {/* Manager-only */}
      <Route
        path="/manager"
        element={
          <RequireManager>
            <ManagerDashboardPage />
          </RequireManager>
        }
      />

      {/* Convenience redirect */}
      <Route path="/home" element={<Navigate to="/" replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
