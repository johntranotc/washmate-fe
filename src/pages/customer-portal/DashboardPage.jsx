import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { vehicleApi } from "@/api/vehicleApi";
import { loyaltyApi } from "@/api/loyaltyApi";
import { loadCustomerBookingList } from "@/lib/customer-bookings";
import { normalizeLoyaltyAccount, normalizeTiers } from "@/lib/customer-loyalty-data";
import { DashboardHero } from "@/components/customer-portal/dashboard-hero";
import { DashboardStatsGrid } from "@/components/customer-portal/stats-grid";
import { QuickActions } from "@/components/customer-portal/quick-actions";
import { UpcomingBookings } from "@/components/customer-portal/upcoming-bookings";
import { MyVehicles } from "@/components/customer-portal/my-vehicles";
import { MembershipSummary } from "@/components/customer-portal/membership-summary";
import { CareTips } from "@/components/customer-portal/care-tips";
import { RecentNotifications } from "@/components/customer-portal/recent-notifications";
import { RecentHistory } from "@/components/customer-portal/recent-history";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}

/**
 * Tổng quan khách hàng — tải dữ liệu thật MỘT lần ở cấp trang
 * (GET /bookings của tôi, GET /v1/vehicles/my-vehicles, GET loyalty/me)
 * rồi truyền xuống các block, giống pattern trang Staff/Admin.
 * Loyalty lỗi/chưa có tài khoản → truyền null, block hiển thị trung thực.
 */
export default function DashboardPage() {
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loyalty, setLoyalty] = useState(null);
  const [loyaltyTiers, setLoyaltyTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [bRes, vRes, lRes] = await Promise.allSettled([
      loadCustomerBookingList(),
      vehicleApi.getMyVehicles(),
      loyaltyApi.getMyLoyalty(),
    ]);
    if (bRes.status === "fulfilled") {
      setBookings(bRes.value?.bookings || []);
    } else {
      console.error("[CustomerDashboard] load bookings failed:", bRes.reason);
      setBookings([]);
      setError("Không thể tải dữ liệu lịch đặt. Vui lòng thử lại.");
    }
    if (vRes.status === "fulfilled") {
      const v = vRes.value;
      setVehicles(Array.isArray(v) ? v : Array.isArray(v?.data) ? v.data : []);
    } else {
      setVehicles([]);
    }
    // Loyalty: chuẩn hoá về 1 tài khoản chính (giống trang Điểm thành viên) — không bịa 0 điểm/hạng Đồng.
    const account = lRes.status === "fulfilled" ? normalizeLoyaltyAccount(lRes.value) : null;
    setLoyalty(account);
    if (account?.garageId != null) {
      try {
        setLoyaltyTiers(normalizeTiers(await loyaltyApi.getCustomerTiers(account.garageId)));
      } catch {
        setLoyaltyTiers([]);
      }
    } else {
      setLoyaltyTiers([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      {/* Banner full-bleed: tràn sát 2 mép + đụng header, chứa luôn eyebrow/mô tả */}
      <DashboardHero />

      <PageContainer variant="customer" className="pb-16">
      {loading ? (
        <DashboardSkeleton />
      ) : error && !bookings.length && !vehicles.length ? (
        <div className="rounded-2xl border border-critical/25 bg-critical-container p-8 text-center">
          <AlertTriangle className="mx-auto mb-3 text-critical" size={28} />
          <p className="text-sm font-bold text-critical">{error}</p>
          <Button size="sm" onClick={load} className="mt-4 bg-critical text-white hover:bg-critical/90">
            <RefreshCw /> Thử lại
          </Button>
        </div>
      ) : (
        <>
          <DashboardStatsGrid bookings={bookings} vehicles={vehicles} loyalty={loyalty} />
          <div className="grid gap-6 lg:grid-cols-2">
            <UpcomingBookings bookings={bookings} />
            <MyVehicles vehicles={vehicles} />
          </div>
          <QuickActions />
          <MembershipSummary account={loyalty} tiers={loyaltyTiers} />
          <div className="grid gap-6 lg:grid-cols-2">
            <RecentNotifications />
            <RecentHistory bookings={bookings} />
          </div>
          <CareTips bookings={bookings} vehicles={vehicles} />
        </>
      )}
      </PageContainer>
    </>
  );
}
