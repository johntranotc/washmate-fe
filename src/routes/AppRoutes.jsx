import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import AuthLayout from "../layouts/AuthLayout";
import CustomerLayout from "../layouts/CustomerLayout";
import StaffLayout from "../layouts/StaffLayout";
import AdminLayout from "../layouts/AdminLayout";
import HomePage from "../pages/public/HomePage";
import ServicesPage from "../pages/public/ServicesPage";
import PricingPage from "../pages/public/PricingPage";
import TiersPage from "../pages/public/TiersPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import SelectWorkspacePage from "../pages/auth/SelectWorkspacePage";
import CustomerHomePage from "../pages/customer/CustomerHomePage";
import VehiclePage from "../pages/customer/VehiclePage";
import BookingCreatePage from "../pages/customer/BookingCreatePage";
import BookingDetailPage from "../pages/customer/BookingDetailPage";
import PaymentPage from "../pages/customer/PaymentPage";
import InvoicePage from "../pages/customer/InvoicePage";
import LoyaltyPage from "../pages/customer/LoyaltyPage";
import StaffBookingSearchPage from "../pages/staff/StaffBookingSearchPage";
import StaffWorkflowPage from "../pages/staff/StaffWorkflowPage";
import StaffQueuePage from "../pages/staff/StaffQueuePage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import ScrollToHash from "./ScrollToHash";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToHash />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/dich-vu" element={<ServicesPage />} />
          <Route path="/bang-gia" element={<PricingPage />} />
          <Route path="/hang-thanh-vien" element={<TiersPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/dang-nhap" element={<LoginPage />} />
          <Route path="/dang-ky" element={<RegisterPage />} />
          <Route path="/quen-mat-khau" element={<ForgotPasswordPage />} />
        </Route>
        <Route path="/chon-khong-gian-lam-viec" element={<SelectWorkspacePage />} />

        <Route path="/services" element={<Navigate to="/dich-vu" replace />} />
        <Route path="/pricing" element={<Navigate to="/bang-gia" replace />} />
        <Route path="/tiers" element={<Navigate to="/hang-thanh-vien" replace />} />
        <Route path="/login" element={<Navigate to="/dang-nhap" replace />} />
        <Route path="/register" element={<Navigate to="/dang-ky" replace />} />
        <Route path="/forgot-password" element={<Navigate to="/quen-mat-khau" replace />} />
        <Route path="/select-workspace" element={<Navigate to="/chon-khong-gian-lam-viec" replace />} />

        <Route element={<CustomerLayout />}>
          <Route path="/customer" element={<CustomerHomePage />} />
          <Route path="/customer/dashboard" element={<CustomerHomePage />} />
          <Route path="/customer/vehicles" element={<VehiclePage />} />
          <Route path="/customer/booking" element={<BookingCreatePage />} />
          <Route path="/customer/bookings/create" element={<BookingCreatePage />} />
          <Route path="/customer/bookings/:bookingId" element={<BookingDetailPage />} />
          <Route path="/customer/bookings/:bookingId/payment" element={<PaymentPage />} />
          <Route path="/customer/bookings/:bookingId/invoice" element={<InvoicePage />} />
          <Route path="/customer/loyalty" element={<LoyaltyPage />} />
        </Route>
        <Route element={<StaffLayout />}>
          <Route path="/staff/bookings" element={<StaffBookingSearchPage />} />
          <Route path="/staff/queue" element={<StaffQueuePage />} />
          <Route path="/staff/bookings/:bookingId/workflow" element={<StaffWorkflowPage />} />
        </Route>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        </Route>

        <Route path="*" element={<div className="grid min-h-screen place-items-center text-xl font-bold">404 - Không tìm thấy trang</div>} />
      </Routes>
    </BrowserRouter>
  );
}
