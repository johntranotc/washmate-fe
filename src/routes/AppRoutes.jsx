import { BrowserRouter, Route, Routes } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import SelectWorkspacePage from "../pages/auth/SelectWorkspacePage";

import HomePage from "../pages/public/HomePage";
import ServicesPage from "../pages/public/ServicesPage";
import PricingPage from "../pages/public/PricingPage";
import TiersPage from "../pages/public/TiersPage";

import CustomerHomePage from "../pages/customer/CustomerHomePage";
import VehiclePage from "../pages/customer/VehiclePage";
import BookingCreatePage from "../pages/customer/BookingCreatePage";
import BookingDetailPage from "../pages/customer/BookingDetailPage";
import PaymentPage from "../pages/customer/PaymentPage";
import InvoicePage from "../pages/customer/InvoicePage";
import LoyaltyPage from "../pages/customer/LoyaltyPage";
import PublicLayout from "../layouts/PublicLayout";
import AuthLayout from "../layouts/AuthLayout";
import CustomerLayout from "../layouts/CustomerLayout";
import StaffLayout from "../layouts/StaffLayout";
import AdminLayout from "../layouts/AdminLayout";
import StaffBookingSearchPage from "../pages/staff/StaffBookingSearchPage";
import StaffWorkflowPage from "../pages/staff/StaffWorkflowPage";

import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import ScrollToHash from "./ScrollToHash";

function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToHash />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/tiers" element={<TiersPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        <Route path="/select-workspace" element={<SelectWorkspacePage />} />

        <Route element={<CustomerLayout />}>
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
        </Route>

        <Route element={<StaffLayout />}>
          <Route path="/staff/bookings" element={<StaffBookingSearchPage />} />
          <Route
            path="/staff/bookings/:bookingId/workflow"
            element={<StaffWorkflowPage />}
          />
        </Route>

        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        </Route>

        <Route path="*" element={<div>404 - Không tìm thấy trang</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
