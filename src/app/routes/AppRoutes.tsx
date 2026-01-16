import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "../../pages/HomePage";
import VenuesPage from "../../pages/VenuesPage";
import VenuePage from "../../pages/VenuePage";
import LoginPage from "../../pages/LoginPage";
import RegisterPage from "../../pages/RegisterPage";
import ProfilePage from "../../pages/ProfilePage";
import ManagerDashboardPage from "../../pages/ManagerDashboardPage";
import NotFoundPage from "../../pages/NotFoundPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/venues" element={<VenuesPage />} />
      <Route path="/venues/:id" element={<VenuePage />} />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Logged-in areas (route guards later) */}
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/manager" element={<ManagerDashboardPage />} />

      {/* Small convenience redirect */}
      <Route path="/home" element={<Navigate to="/" replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
