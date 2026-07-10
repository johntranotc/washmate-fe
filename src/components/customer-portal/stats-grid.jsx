import { Calendar, Car, Star, Award } from "lucide-react";
import { KpiCard } from "@/components/shared/KpiCard";
import { formatNumber } from "@/lib/format";
import { tierLabel } from "@/components/customer-portal/tier-badge";

/**
 * StatCard (compat) — giữ export cũ cho LoyaltyStatsGrid, render qua KpiCard chung
 * để mọi thẻ số liệu customer cùng chuẩn với Staff/Admin.
 */
export function StatCard({ icon, value, label, description }) {
  return (
    <KpiCard
      label={label}
      value={value}
      icon={icon}
      tone="bg-primary-container text-primary"
      subtitle={description ? <p className="text-xs text-neutral-muted">{description}</p> : null}
    />
  );
}

/**
 * KPI khách hàng — dùng KpiCard chung với Staff/Admin (cùng cỡ chữ, icon tròn pastel).
 * Dữ liệu nhận từ trang (API thật): bookings, vehicles, loyalty.
 * Chưa có tài khoản loyalty → hiển thị "—" + "Chưa có dữ liệu", không bịa 0 điểm/hạng.
 */
export function DashboardStatsGrid({ bookings = [], vehicles = [], loyalty = null }) {
  const points = loyalty ? Number(loyalty.availablePoints ?? loyalty.points ?? 0) || 0 : null;
  // Hạng lấy TRỰC TIẾP từ dữ liệu thật (tierName của BE) — không suy diễn ngưỡng.
  const tierName = loyalty && loyalty.tierName ? tierLabel(loyalty.tierName) : null;

  const noLoyalty = (
    <p className="text-xs text-neutral-muted">Chưa có dữ liệu</p>
  );

  const cards = [
    {
      key: "bookings", label: "Lịch đặt của tôi", value: formatNumber(bookings.length),
      icon: <Calendar size={18} />, tone: "bg-primary-container text-primary",
      subtitle: <p className="text-xs text-neutral-muted">Tổng lịch rửa xe của bạn</p>,
    },
    {
      key: "vehicles", label: "Xe đã lưu", value: formatNumber(vehicles.length),
      icon: <Car size={18} />, tone: "bg-accent-cyan/10 text-accent-cyan",
      subtitle: <p className="text-xs text-neutral-muted">Phương tiện trong tài khoản</p>,
    },
    {
      key: "points", label: "Điểm hiện tại", value: points == null ? "—" : formatNumber(points),
      icon: <Star size={18} />, tone: "bg-gold/20 text-gold-ink",
      subtitle: points == null ? noLoyalty : <p className="text-xs text-neutral-muted">Dùng để đổi ưu đãi</p>,
    },
    {
      key: "tier", label: "Hạng thành viên", value: tierName || "—",
      icon: <Award size={18} />, tone: "bg-accent-violet/10 text-accent-violet",
      subtitle: tierName ? <p className="text-xs text-neutral-muted">Quyền lợi theo hạng</p> : noLoyalty,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ key, ...card }) => <KpiCard key={key} {...card} />)}
    </div>
  );
}
