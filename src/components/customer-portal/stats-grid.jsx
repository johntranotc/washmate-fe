import { useEffect, useState } from "react";
import { Calendar, Car, Star, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { vehicleApi } from "@/api/vehicleApi";
import { loyaltyApi } from "@/api/loyaltyApi";
import { loadCustomerBookingList } from "@/lib/customer-bookings";
import { resolveTierInfo } from "@/lib/customer-engagement-data";

export function StatCard({ icon, value, label, description }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-2 text-sm font-medium text-muted-foreground">{label}</div>
          <div className="mb-1 text-4xl font-extrabold leading-tight text-foreground">{value}</div>
          <p className="text-sm font-medium text-muted-foreground">{description}</p>
        </div>
        <div className="text-primary">{icon}</div>
      </div>
    </div>
  );
}

export function DashboardStatsGrid() {
  const [stats, setStats] = useState({
    bookingCount: 0,
    vehicleCount: 0,
    points: 0,
    tierName: "Đồng",
  });

  useEffect(() => {
    async function fetchAll() {
      let bCount = 0;
      let vCount = 0;
      let pts = 0;
      let tier = "Đồng";

      try {
        const bRes = await loadCustomerBookingList();
        if (bRes?.bookings) bCount = bRes.bookings.length;
      } catch {}

      try {
        const vRes = await vehicleApi.getMyVehicles();
        if (Array.isArray(vRes)) vCount = vRes.length;
        else if (vRes?.data && Array.isArray(vRes.data)) vCount = vRes.data.length;
      } catch {}

      try {
        const lRes = await loyaltyApi.getMyLoyalty();
        if (lRes) {
          pts = Number(lRes.availablePoints ?? lRes.points ?? 0) || 0;
          const calc = resolveTierInfo(pts, lRes.tierName || lRes.tier);
          tier = calc.tierName;
        }
      } catch {}

      setStats({ bookingCount: bCount, vehicleCount: vCount, points: pts, tierName: tier });
    }
    fetchAll();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={<Calendar size={32} />}
        value={stats.bookingCount}
        label="Lịch đặt của tôi"
        description="Tổng số lịch đặt rửa xe của bạn"
      />
      <StatCard
        icon={<Car size={32} />}
        value={stats.vehicleCount}
        label="Xe đã lưu"
        description="Phương tiện trong tài khoản của bạn"
      />
      <StatCard
        icon={<Star size={32} />}
        value={(Number(stats.points) || 0).toLocaleString("vi-VN")}
        label="Điểm hiện tại"
        description="Có thể dùng để đổi ưu đãi"
      />
      <StatCard
        icon={<Award size={32} />}
        value={stats.tierName}
        label="Hạng thành viên"
        description="Bạn đang nhận nhiều quyền lợi hơn"
      />
    </div>
  );
}
