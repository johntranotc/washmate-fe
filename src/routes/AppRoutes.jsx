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
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/dich-vu" element={<ServicesPage />} />
          <Route path="/bang-gia" element={<PricingPage />} />
          <Route path="/hang-thanh-vien" element={<TiersPage />} />
        </Route>

        {/* Auth */}
        <Route element={<AuthLayout />}>
          <Route path="/dang-nhap" element={<LoginPage />} />
          <Route path="/dang-ky" element={<RegisterPage />} />
          <Route path="/quen-mat-khau" element={<ForgotPasswordPage />} />

          <Route path="/login" element={<Navigate to="/dang-nhap" replace />} />
          <Route
            path="/register"
            element={<Navigate to="/dang-ky" replace />}
          />
          <Route
            path="/forgot-password"
            element={<Navigate to="/quen-mat-khau" replace />}
          />
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

        {/* Khách hàng - route tiếng Việt chính */}
        <Route element={<CustomerLayout />}>
          <Route path="/khach-hang" element={<CustomerHomePage />} />
          <Route path="/khach-hang/tong-quan" element={<CustomerHomePage />} />
          <Route path="/khach-hang/xe-cua-toi" element={<VehiclePage />} />
          <Route
            path="/khach-hang/dich-vu"
            element={<Navigate to="/khach-hang/dat-lich" replace />}
          />
          <Route path="/khach-hang/dat-lich" element={<BookingCreatePage />} />
          <Route
            path="/khach-hang/dat-lich-moi"
            element={<BookingCreatePage />}
          />
          <Route
            path="/khach-hang/lich-dat"
            element={<BookingManagementPage />}
          />
          <Route
            path="/khach-hang/lich-dat/:bookingId"
            element={<BookingDetailPage />}
          />
          <Route
            path="/khach-hang/lich-dat/:bookingId/thanh-toan"
            element={<PaymentPage />}
          />
          <Route
            path="/khach-hang/lich-dat/:bookingId/hoa-don"
            element={<InvoicePage />}
          />
          <Route
            path="/khach-hang/thanh-toan"
            element={<Navigate to="/khach-hang/lich-dat" replace />}
          />
          <Route
            path="/khach-hang/hoa-don"
            element={<Navigate to="/khach-hang/lich-dat" replace />}
          />
          <Route path="/khach-hang/diem-thuong" element={<LoyaltyPage />} />
          <Route path="/khach-hang/diem-thanh-vien" element={<LoyaltyPage />} />
          <Route
            path="/khach-hang/uu-dai"
            element={<CustomerPromotionsPage />}
          />
          <Route path="/khach-hang/doi-thuong" element={<RewardsPage />} />
          <Route path="/khach-hang/thong-bao" element={<NotificationPage />} />
          <Route path="/khach-hang/ho-so" element={<AccountPage />} />
          <Route path="/khach-hang/tai-khoan" element={<AccountPage />} />

          {/* Customer route cũ - giữ để không vỡ code */}
          <Route
            path="/customer"
            element={<Navigate to="/khach-hang" replace />}
          />
          <Route
            path="/customer/dashboard"
            element={<Navigate to="/khach-hang/tong-quan" replace />}
          />
          <Route
            path="/customer/vehicles"
            element={<Navigate to="/khach-hang/xe-cua-toi" replace />}
          />
          <Route
            path="/customer/services"
            element={<Navigate to="/khach-hang/dich-vu" replace />}
          />
          <Route
            path="/customer/booking"
            element={<Navigate to="/khach-hang/dat-lich" replace />}
          />
          <Route
            path="/customer/bookings/create"
            element={<Navigate to="/khach-hang/dat-lich" replace />}
          />
          <Route
            path="/customer/bookings"
            element={<Navigate to="/khach-hang/lich-dat" replace />}
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
          <Route
            path="/customer/payments"
            element={<Navigate to="/khach-hang/lich-dat" replace />}
          />
          <Route
            path="/customer/payments/:paymentId"
            element={<PaymentPage />}
          />
          <Route
            path="/customer/invoices"
            element={<Navigate to="/khach-hang/lich-dat" replace />}
          />
          <Route
            path="/customer/invoices/:invoiceId"
            element={<InvoicePage />}
          />
          <Route
            path="/customer/loyalty"
            element={<Navigate to="/khach-hang/diem-thuong" replace />}
          />
          <Route
            path="/customer/promotions"
            element={<Navigate to="/khach-hang/uu-dai" replace />}
          />
          <Route
            path="/customer/rewards"
            element={<Navigate to="/khach-hang/doi-thuong" replace />}
          />
          <Route
            path="/customer/notifications"
            element={<Navigate to="/khach-hang/thong-bao" replace />}
          />
          <Route
            path="/customer/profile"
            element={<Navigate to="/khach-hang/ho-so" replace />}
          />
        </Route>

        {/* Nhân viên - route tiếng Việt chính */}
        <Route element={<StaffLayout />}>
          <Route path="/nhan-vien" element={<StaffDashboardPage />} />
          <Route path="/nhan-vien/tong-quan" element={<StaffDashboardPage />} />
          <Route
            path="/nhan-vien/lich-hom-nay"
            element={<StaffBookingSearchPage />}
          />
          <Route
            path="/nhan-vien/lich-dat"
            element={<StaffBookingSearchPage />}
          />
          <Route path="/nhan-vien/dang-xu-ly" element={<StaffQueuePage />} />
          <Route
            path="/nhan-vien/lich-dat/:bookingId"
            element={<StaffWorkflowPage />}
          />
          <Route
            path="/nhan-vien/lich-dat/:bookingId/quy-trinh"
            element={<StaffWorkflowPage />}
          />

          {/* Staff route cũ - giữ để không vỡ code */}
          <Route path="/staff" element={<Navigate to="/nhan-vien" replace />} />
          <Route
            path="/staff/dashboard"
            element={<Navigate to="/nhan-vien/tong-quan" replace />}
          />
          <Route
            path="/staff/bookings"
            element={<Navigate to="/nhan-vien/lich-dat" replace />}
          />
          <Route
            path="/staff/queue"
            element={<Navigate to="/nhan-vien/dang-xu-ly" replace />}
          />
          <Route
            path="/staff/bookings/:bookingId"
            element={<StaffWorkflowPage />}
          />
          <Route
            path="/staff/bookings/:bookingId/workflow"
            element={<StaffWorkflowPage />}
          />
        </Route>

        {/* Quản trị - route tiếng Việt chính */}
        <Route element={<AdminLayout />}>
          <Route path="/quan-tri" element={<AdminDashboardPage />} />
          <Route path="/quan-tri/tong-quan" element={<AdminDashboardPage />} />
          <Route path="/quan-tri/gara" element={<GarageManagementPage />} />
          <Route path="/quan-tri/dich-vu" element={<AdminServicePage />} />
          <Route path="/quan-tri/khung-gio" element={<AdminSlotPage />} />
          <Route path="/quan-tri/lich-dat" element={<AdminBookingPage />} />
          <Route path="/quan-tri/thanh-toan" element={<AdminPaymentPage />} />
          <Route path="/quan-tri/hoa-don" element={<AdminInvoicePage />} />
          <Route path="/quan-tri/bao-cao" element={<AdminReportPage />} />

          {/* Admin route cũ - giữ để không vỡ code */}
          <Route path="/admin" element={<Navigate to="/quan-tri" replace />} />
          <Route
            path="/admin/dashboard"
            element={<Navigate to="/quan-tri/tong-quan" replace />}
          />
          <Route
            path="/admin/garages"
            element={<Navigate to="/quan-tri/gara" replace />}
          />
          <Route
            path="/admin/services"
            element={<Navigate to="/quan-tri/dich-vu" replace />}
          />
          <Route
            path="/admin/slots"
            element={<Navigate to="/quan-tri/khung-gio" replace />}
          />
          <Route
            path="/admin/bookings"
            element={<Navigate to="/quan-tri/lich-dat" replace />}
          />
          <Route
            path="/admin/payments"
            element={<Navigate to="/quan-tri/thanh-toan" replace />}
          />
          <Route
            path="/admin/invoices"
            element={<Navigate to="/quan-tri/hoa-don" replace />}
          />
          <Route
            path="/admin/reports"
            element={<Navigate to="/quan-tri/bao-cao" replace />}
          />
        </Route>

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
