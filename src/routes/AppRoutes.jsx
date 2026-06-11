import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";

import CustomerHomePage from "../pages/customer/CustomerHomePage";
import VehiclePage from "../pages/customer/VehiclePage";
import BookingManagementPage from "../pages/customer/BookingManagementPage";
import BookingCreatePage from "../pages/customer/BookingCreatePage";
import BookingDetailPage from "../pages/customer/BookingDetailPage";
import PaymentPage from "../pages/customer/PaymentPage";
import InvoicePage from "../pages/customer/InvoicePage";
import LoyaltyPage from "../pages/customer/LoyaltyPage";
import NotificationPage from "../pages/customer/NotificationPage";

import AuthLayout from "../layouts/AuthLayout";
import CustomerLayout from "../layouts/CustomerLayout";
import StaffLayout from "../layouts/StaffLayout";
import AdminLayout from "../layouts/AdminLayout";

import StaffBookingSearchPage from "../pages/staff/StaffBookingSearchPage";
import StaffWorkflowPage from "../pages/staff/StaffWorkflowPage";
import StaffQueuePage from "../pages/staff/StaffQueuePage";

import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminManagementPage from "../pages/admin/AdminManagementPage";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute roles={["CUSTOMER"]} />}>
          <Route element={<CustomerLayout />}>
            <Route path="/customer" element={<CustomerHomePage />} />
            <Route path="/customer/vehicles" element={<VehiclePage />} />
            <Route path="/customer/bookings" element={<BookingManagementPage />} />
            <Route path="/customer/bookings/create" element={<BookingCreatePage />} />
            <Route path="/customer/bookings/:bookingId" element={<BookingDetailPage />} />
            <Route path="/customer/bookings/:bookingId/payment" element={<PaymentPage />} />
            <Route path="/customer/bookings/:bookingId/invoice" element={<InvoicePage />} />
            <Route path="/customer/loyalty" element={<LoyaltyPage />} />
            <Route path="/customer/notifications" element={<NotificationPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={["STAFF"]} />}>
          <Route element={<StaffLayout />}>
            <Route path="/staff/bookings" element={<StaffBookingSearchPage />} />
            <Route path="/staff/queue" element={<StaffQueuePage />} />
            <Route path="/staff/bookings/:bookingId/workflow" element={<StaffWorkflowPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/management" element={<AdminManagementPage />} />
          </Route>
        </Route>

        <Route path="*" element={<div>404 - Không tìm thấy trang</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
