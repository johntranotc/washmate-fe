import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";

import CustomerHomePage from "../pages/customer/CustomerHomePage";
import VehiclePage from "../pages/customer/VehiclePage";
import BookingCreatePage from "../pages/customer/BookingCreatePage";
import BookingDetailPage from "../pages/customer/BookingDetailPage";
import PaymentPage from "../pages/customer/PaymentPage";
import InvoicePage from "../pages/customer/InvoicePage";
import LoyaltyPage from "../pages/customer/LoyaltyPage";

import StaffBookingSearchPage from "../pages/staff/StaffBookingSearchPage";
import StaffWorkflowPage from "../pages/staff/StaffWorkflowPage";

import AdminDashboardPage from "../pages/admin/AdminDashboardPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/customer" element={<CustomerHomePage />} />
        <Route path="/customer/vehicles" element={<VehiclePage />} />
        <Route
          path="/customer/bookings/create"
          element={<BookingCreatePage />}
        />
        <Route
          path="/customer/bookings/:bookingId"
          element={<BookingDetailPage />}
        />
        <Route
          path="/customer/bookings/:bookingId/payment"
          element={<PaymentPage />}
        />
        <Route
          path="/customer/bookings/:bookingId/invoice"
          element={<InvoicePage />}
        />
        <Route path="/customer/loyalty" element={<LoyaltyPage />} />

        <Route path="/staff/bookings" element={<StaffBookingSearchPage />} />
        <Route
          path="/staff/bookings/:bookingId/workflow"
          element={<StaffWorkflowPage />}
        />

        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

        <Route path="*" element={<div>404 - Không tìm thấy trang</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
