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
import CustomerPortalLayout from "../layouts/CustomerPortalLayout";
import StaffLayout from "../layouts/StaffLayout";
import AdminLayout from "../layouts/AdminLayout";

import DashboardPage from "../pages/customer-portal/DashboardPage";
import VehiclesPage from "../pages/customer-portal/VehiclesPage";
import NewBookingPage from "../pages/customer-portal/NewBookingPage";
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
import StaffBookingSearchPage from "../pages/staff/StaffBookingSearchPage";
import StaffWorkflowPage from "../pages/staff/StaffWorkflowPage";
import StaffDashboardPage from "../pages/staff/StaffDashboardPage";
import StaffQueuePage from "../pages/staff/StaffQueuePage";
import StaffBookingListPage from "../pages/staff/StaffBookingListPage";
import StaffBookingWorkflowPage from "../pages/staff/StaffBookingWorkflowPage";

import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminBookingPage from "../pages/admin/AdminBookingPage";
import AdminCustomerPage from "../pages/admin/AdminCustomerPage";
import AdminGaragePage from "../pages/admin/AdminGaragePage";
import AdminPaymentPage from "../pages/admin/AdminPaymentPage";
import AdminRevenuePage from "../pages/admin/AdminRevenuePage";
import AdminLoyaltyPage from "../pages/admin/AdminLoyaltyPage";
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
          <Route path="/tiers" element={<TiersPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dang-nhap" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        <Route path="/select-workspace" element={<SelectWorkspacePage />} />
        <Route path="/chon-khong-gian-lam-viec" element={<SelectWorkspacePage />} />

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

        <Route element={<CustomerPortalLayout />}>
          <Route path="/khach-hang" element={<DashboardPage />} />
          <Route path="/khach-hang/xe-cua-toi" element={<VehiclesPage />} />
          <Route path="/khach-hang/dat-lich-moi" element={<CustomerBookingFlowPage />} />
          <Route path="/khach-hang/dat-lich-moi-v2" element={<NewBookingPage />} />
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
        </Route>

        <Route element={<StaffLayout />}>
          <Route path="/staff/bookings" element={<StaffBookingSearchPage />} />
          <Route
            path="/staff/bookings/:bookingId/workflow"
            element={<StaffWorkflowPage />}
          />
        </Route>

        <Route
          element={
            <RequireRole role={ROLES.STAFF}>
              <StaffLayout />
            </RequireRole>
          }
        >
          <Route path="/nhan-vien" element={<StaffDashboardPage />} />
          <Route path="/nhan-vien/hang-doi" element={<StaffQueuePage />} />
          <Route path="/nhan-vien/danh-sach" element={<StaffBookingListPage />} />
          <Route path="/nhan-vien/danh-sach/:bookingId" element={<StaffBookingWorkflowPage />} />
        </Route>

        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        </Route>

        <Route
          element={
            <RequireRole role={ROLES.ADMIN}>
              <AdminLayout />
            </RequireRole>
          }
        >
          <Route path="/quan-tri" element={<AdminDashboardPage />} />
          <Route path="/quan-tri/dat-lich" element={<AdminBookingPage />} />
          <Route path="/quan-tri/khach-hang" element={<AdminCustomerPage />} />
          <Route path="/quan-tri/gara" element={<AdminGaragePage />} />
          <Route path="/quan-tri/thanh-toan" element={<AdminPaymentPage />} />
          <Route path="/quan-tri/doanh-thu" element={<AdminRevenuePage />} />
          <Route path="/quan-tri/diem-thanh-vien" element={<AdminLoyaltyPage />} />
          <Route path="/quan-tri/cai-dat" element={<AdminSettingsPage />} />
        </Route>

        <Route path="*" element={<div>404 - Không tìm thấy trang</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
