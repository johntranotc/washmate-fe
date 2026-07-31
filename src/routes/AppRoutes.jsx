import { BrowserRouter, Route, Routes } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import HomePage from "../pages/public/HomePage";
import ServicesPage from "../pages/public/ServicesPage";
import PricingPage from "../pages/public/PricingPage";

import PublicLayout from "../layouts/PublicLayout";
import AuthLayout from "../layouts/AuthLayout";
import CustomerPortalLayout from "../layouts/CustomerPortalLayout";
import StaffLayout from "../layouts/StaffLayout";
import AdminLayout from "../layouts/AdminLayout";
import VnpayReturnPage from "../pages/customer-portal/VnpayReturnPage";

import DashboardPage from "../pages/customer-portal/DashboardPage";
import VehiclesPage from "../pages/customer-portal/VehiclesPage";
import CustomerBookingFlowPage from "../pages/customer-portal/CustomerBookingFlowPage";
import MyBookingsPage from "../pages/customer-portal/MyBookingsPage";
import CustomerBookingDetailPage from "../pages/customer-portal/CustomerBookingDetailPage";
import PaymentInvoicePage from "../pages/customer-portal/PaymentInvoicePage";
import CustomerPaymentPage from "../pages/customer-portal/CustomerPaymentPage";
import CustomerInvoicePage from "../pages/customer-portal/CustomerInvoicePage";
import MembershipPointsPage from "../pages/customer-portal/MembershipPointsPage";
import RewardsPage from "../pages/customer-portal/RewardsPage";
import PromotionsPage from "../pages/customer-portal/PromotionsPage";
import NotificationsPage from "../pages/customer-portal/NotificationsPage";
import AccountPage from "../pages/customer-portal/AccountPage";
import ChangePasswordPage from "../pages/customer-portal/ChangePasswordPage";
// Staff pages
import StaffBookingSearchPage from "../pages/staff/StaffBookingSearchPage";
import StaffWorkflowPage from "../pages/staff/StaffWorkflowPage";
import StaffDashboardPage from "../pages/staff/StaffDashboardPage";
import StaffQueuePage from "../pages/staff/StaffQueuePage";
import StaffBookingListPage from "../pages/staff/StaffBookingListPage";
import StaffBookingWorkflowPage from "../pages/staff/StaffBookingWorkflowPage";
import StaffProfilePage from "../pages/staff/StaffProfilePage";

// Admin pages
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminGaragePage from "../pages/admin/AdminGaragePage";
import AdminServicePage from "../pages/admin/AdminServicePage";
import AdminUserPage from "../pages/admin/AdminUserPage";
import AdminBookingPage from "../pages/admin/AdminBookingPage";
import AdminInvoicePage from "../pages/admin/AdminInvoicePage";
import AdminReportPage from "../pages/admin/AdminReportPage";
import AdminInsightPage from "../pages/admin/AdminInsightPage";
import AdminProfilePage from "../pages/admin/AdminProfilePage";
import AdminLoyaltyPage from "../pages/admin/AdminLoyaltyPage";
import AdminCampaignPage from "../pages/admin/AdminCampaignPage";
import AdminStaffPage from "../pages/admin/AdminStaffPage";
import AdminSettingsPage from "../pages/admin/AdminSettingsPage";

import ScrollToHash from "./ScrollToHash";
import { RequireRole } from "../components/auth/RequireRole";
import { ROLES } from "../lib/auth-role";

function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToHash />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
        </Route>

        {/* Trang VNPAY trả về: đứng riêng, KHÔNG có header/footer public (khách vừa
            thanh toán đã đăng nhập, hiện "Đăng nhập/Đăng ký" là vô lý). */}
        <Route path="/payment/vnpay-return" element={<VnpayReturnPage />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dang-nhap" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Tree /customer cũ đã gỡ: trùng chức năng với /khach-hang (login điều hướng /khach-hang),
            không còn link nội bộ trỏ vào và chứa flow demo. Files giữ nguyên để tham khảo. */}

        <Route
          element={
            <RequireRole role={ROLES.CUSTOMER}>
              <CustomerPortalLayout />
            </RequireRole>
          }
        >
          <Route path="/khach-hang" element={<DashboardPage />} />
          <Route path="/khach-hang/xe-cua-toi" element={<VehiclesPage />} />
          <Route path="/khach-hang/dat-lich-moi" element={<CustomerBookingFlowPage />} />
          {/* Route dat-lich-moi-v2 đã gỡ: NewBookingPage dùng danh sách dịch vụ/gara hardcode (mock) */}
          <Route path="/khach-hang/lich-dat" element={<MyBookingsPage />} />
          <Route path="/khach-hang/lich-dat/:bookingId" element={<CustomerBookingDetailPage />} />
          <Route path="/khach-hang/thanh-toan" element={<PaymentInvoicePage />} />
          <Route path="/khach-hang/thanh-toan/:bookingId" element={<CustomerPaymentPage />} />
          <Route path="/khach-hang/thanh-toan/:bookingId/hoa-don" element={<CustomerInvoicePage />} />
          <Route path="/khach-hang/diem-thanh-vien" element={<MembershipPointsPage />} />
          <Route path="/khach-hang/doi-thuong" element={<RewardsPage />} />
          <Route path="/khach-hang/uu-dai" element={<PromotionsPage />} />
          <Route path="/khach-hang/thong-bao" element={<NotificationsPage />} />
          <Route path="/khach-hang/tai-khoan" element={<AccountPage />} />
          <Route path="/khach-hang/doi-mat-khau" element={<ChangePasswordPage />} />
        </Route>

        {/* Staff — role-protected */}
        <Route
          element={
            <RequireRole role={ROLES.STAFF}>
              <StaffLayout />
            </RequireRole>
          }
        >
          {/* Route chuẩn tiếng Việt + alias tiếng Anh cũ (giữ link cũ hoạt động) */}
          <Route path="/nhan-vien/tra-cuu" element={<StaffBookingSearchPage />} />
          <Route path="/nhan-vien/tra-cuu/:bookingId/workflow" element={<StaffWorkflowPage />} />
          <Route path="/staff/bookings" element={<StaffBookingSearchPage />} />
          <Route path="/staff/bookings/:bookingId/workflow" element={<StaffWorkflowPage />} />
          <Route path="/nhan-vien" element={<StaffDashboardPage />} />
          <Route path="/nhan-vien/hang-doi" element={<StaffQueuePage />} />
          <Route path="/nhan-vien/danh-sach" element={<StaffBookingListPage />} />
          <Route path="/nhan-vien/danh-sach/:bookingId" element={<StaffBookingWorkflowPage />} />
          <Route path="/nhan-vien/profile" element={<StaffProfilePage />} />
        </Route>

        {/* Admin — role-protected (MANAGER/OWNER dùng chung Admin Portal) */}
        <Route
          element={
            <RequireRole roles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.OWNER]}>
              <AdminLayout />
            </RequireRole>
          }
        >
          <Route path="/quan-tri" element={<AdminDashboardPage />} />
          <Route path="/quan-tri/garages" element={<AdminGaragePage />} />
          <Route path="/quan-tri/services" element={<AdminServicePage />} />
          <Route path="/quan-tri/users" element={<AdminUserPage />} />
          <Route path="/quan-tri/bookings" element={<AdminBookingPage />} />
          <Route path="/quan-tri/invoices" element={<AdminInvoicePage />} />
          <Route path="/quan-tri/reports" element={<AdminReportPage />} />
          <Route path="/quan-tri/ai-insights" element={<AdminInsightPage />} />
          <Route path="/quan-tri/profile" element={<AdminProfilePage />} />
          <Route path="/quan-tri/loyalty" element={<AdminLoyaltyPage />} />
          <Route path="/quan-tri/campaigns" element={<AdminCampaignPage />} />
          <Route path="/quan-tri/staff" element={<AdminStaffPage />} />
          <Route path="/quan-tri/settings" element={<AdminSettingsPage />} />
        </Route>

        <Route path="*" element={<div className="flex min-h-screen items-center justify-center text-muted-foreground">404 — Không tìm thấy trang</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
