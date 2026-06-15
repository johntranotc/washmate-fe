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
import BookingManagementPage from "../pages/customer/BookingManagementPage";
import BookingDetailPage from "../pages/customer/BookingDetailPage";
import PaymentPage from "../pages/customer/PaymentPage";
import InvoicePage from "../pages/customer/InvoicePage";
import LoyaltyPage from "../pages/customer/LoyaltyPage";
import CustomerPromotionsPage from "../pages/customer/PromotionsPage";
import RewardsPage from "../pages/customer/RewardsPage";
import NotificationPage from "../pages/customer/NotificationPage";
import AccountPage from "../pages/customer-portal/AccountPage";

import StaffBookingSearchPage from "../pages/staff/StaffBookingSearchPage";
import StaffWorkflowPage from "../pages/staff/StaffWorkflowPage";
import StaffQueuePage from "../pages/staff/StaffQueuePage";
import StaffDashboardPage from "../pages/staff/StaffDashboardPage";

import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import GarageManagementPage from "../pages/admin/GarageManagementPage";
import AdminServicePage from "../pages/admin/AdminServicePage";
import AdminSlotPage from "../pages/admin/AdminSlotPage";
import AdminBookingPage from "../pages/admin/AdminBookingPage";
import AdminPaymentPage from "../pages/admin/AdminPaymentPage";
import AdminInvoicePage from "../pages/admin/AdminInvoicePage";
import AdminReportPage from "../pages/admin/AdminReportPage";

import ScrollToHash from "./ScrollToHash";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToHash />

      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/dich-vu" element={<ServicesPage />} />
          <Route path="/bang-gia" element={<PricingPage />} />
          <Route path="/hang-thanh-vien" element={<TiersPage />} />
        </Route>

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/dang-nhap" element={<LoginPage />} />
          <Route path="/dang-ky" element={<RegisterPage />} />
          <Route path="/quen-mat-khau" element={<ForgotPasswordPage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        <Route
          path="/chon-khong-gian-lam-viec"
          element={<SelectWorkspacePage />}
        />

        {/* Public aliases */}
        <Route
          path="/select-workspace"
          element={<Navigate to="/chon-khong-gian-lam-viec" replace />}
        />
        <Route path="/services" element={<Navigate to="/dich-vu" replace />} />
        <Route path="/pricing" element={<Navigate to="/bang-gia" replace />} />
        <Route
          path="/tiers"
          element={<Navigate to="/hang-thanh-vien" replace />}
        />

        {/* Customer flow chính: Prompt 2–3 của Ngữ + Prompt 4–7 của Đạt */}
        <Route element={<CustomerLayout />}>
          <Route path="/customer" element={<CustomerHomePage />} />
          <Route path="/customer/dashboard" element={<CustomerHomePage />} />

          <Route path="/customer/vehicles" element={<VehiclePage />} />

          <Route
            path="/customer/services"
            element={<Navigate to="/customer/booking" replace />}
          />

          <Route path="/customer/booking" element={<BookingCreatePage />} />
          <Route
            path="/customer/bookings/create"
            element={<BookingCreatePage />}
          />

          <Route
            path="/customer/bookings"
            element={<BookingManagementPage />}
          />
          <Route
            path="/customer/bookings/:bookingId"
            element={<BookingDetailPage />}
          />

          <Route
            path="/customer/payments"
            element={<Navigate to="/customer/bookings" replace />}
          />
          <Route
            path="/customer/payments/:paymentId"
            element={<PaymentPage />}
          />
          <Route
            path="/customer/bookings/:bookingId/payment"
            element={<PaymentPage />}
          />

          <Route
            path="/customer/invoices"
            element={<Navigate to="/customer/bookings" replace />}
          />
          <Route
            path="/customer/invoices/:invoiceId"
            element={<InvoicePage />}
          />
          <Route
            path="/customer/bookings/:bookingId/invoice"
            element={<InvoicePage />}
          />

          <Route path="/customer/loyalty" element={<LoyaltyPage />} />
          <Route
            path="/customer/promotions"
            element={<CustomerPromotionsPage />}
          />
          <Route path="/customer/rewards" element={<RewardsPage />} />
          <Route
            path="/customer/notifications"
            element={<NotificationPage />}
          />

          <Route path="/customer/profile" element={<AccountPage />} />
        </Route>

        {/* Alias route của Ngữ: chuyển /khach-hang sang flow hoàn chỉnh /customer */}
        <Route
          path="/khach-hang"
          element={<Navigate to="/customer" replace />}
        />
        <Route
          path="/khach-hang/xe-cua-toi"
          element={<Navigate to="/customer/vehicles" replace />}
        />
        <Route
          path="/khach-hang/dat-lich-moi"
          element={<Navigate to="/customer/booking" replace />}
        />
        <Route
          path="/khach-hang/lich-dat"
          element={<Navigate to="/customer/bookings" replace />}
        />
        <Route
          path="/khach-hang/thanh-toan"
          element={<Navigate to="/customer/bookings" replace />}
        />
        <Route
          path="/khach-hang/diem-thanh-vien"
          element={<Navigate to="/customer/loyalty" replace />}
        />
        <Route
          path="/khach-hang/uu-dai"
          element={<Navigate to="/customer/promotions" replace />}
        />
        <Route
          path="/khach-hang/thong-bao"
          element={<Navigate to="/customer/notifications" replace />}
        />
        <Route
          path="/khach-hang/tai-khoan"
          element={<Navigate to="/customer/profile" replace />}
        />

        {/* Staff flow */}
        <Route element={<StaffLayout />}>
          <Route path="/staff" element={<StaffDashboardPage />} />
          <Route path="/staff/dashboard" element={<StaffDashboardPage />} />
          <Route path="/staff/bookings" element={<StaffBookingSearchPage />} />
          <Route path="/staff/queue" element={<StaffQueuePage />} />
          <Route
            path="/staff/bookings/:bookingId"
            element={<StaffWorkflowPage />}
          />
          <Route
            path="/staff/bookings/:bookingId/workflow"
            element={<StaffWorkflowPage />}
          />
        </Route>

        {/* Admin flow */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/garages" element={<GarageManagementPage />} />
          <Route path="/admin/services" element={<AdminServicePage />} />
          <Route path="/admin/slots" element={<AdminSlotPage />} />
          <Route path="/admin/bookings" element={<AdminBookingPage />} />
          <Route path="/admin/payments" element={<AdminPaymentPage />} />
          <Route path="/admin/invoices" element={<AdminInvoicePage />} />
          <Route path="/admin/reports" element={<AdminReportPage />} />
        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="grid min-h-screen place-items-center text-xl font-bold">
              404 - Không tìm thấy trang
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
