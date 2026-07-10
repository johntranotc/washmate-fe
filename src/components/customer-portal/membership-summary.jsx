import { useNavigate } from "react-router-dom";
import { BadgePercent, Crown, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TierBadge, tierLabel, tierTheme } from "@/components/customer-portal/tier-badge";
import { computeTierProgress } from "@/lib/customer-loyalty-data";

const fmt = (n) => new Intl.NumberFormat("vi-VN").format(Number(n || 0));

/**
 * Điểm thành viên (trang Tổng quan) — ĐỒNG BỘ với hero trang Điểm thành viên:
 * cùng dữ liệu thật (account đã chuẩn hoá + tiers thật) và cùng tông màu theo hạng.
 * Props: account (normalizeLoyaltyAccount) | null, tiers (normalizeTiers).
 */
export function MembershipSummary({ account = null, tiers = [] }) {
  const navigate = useNavigate();

  if (!account) {
    return (
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-lg font-bold text-foreground">Điểm thành viên</h2>
        <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-10 text-center">
          <Star size={36} className="text-border" />
          <p className="mt-3 text-sm font-semibold text-foreground">Bạn chưa có điểm thưởng</p>
          <p className="mt-1 text-xs text-muted-foreground">Điểm sẽ được tích lũy sau mỗi lần rửa xe hoàn tất.</p>
          <Button size="sm" className="mt-4" onClick={() => navigate("/khach-hang/dat-lich-moi")}>
            Đặt lịch rửa xe
          </Button>
        </div>
      </section>
    );
  }

  const theme = tierTheme(account.tierName);
  const progress = computeTierProgress(account, tiers);
  const hasDiscount = account.tierDiscountPercentage > 0;

  return (
    <section className={`overflow-hidden rounded-2xl border p-5 sm:p-6 ${theme.card} ${theme.border}`}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
        {/* Huy hiệu + hạng */}
        <div className="flex items-center gap-4 lg:w-56 lg:flex-col lg:items-center lg:text-center">
          <TierBadge name={account.tierName} size="size-16" className="rounded-2xl shadow-card" iconSize={30} />
          <div className="lg:mt-2">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Hạng hiện tại</p>
            <p className={`text-xl font-extrabold ${theme.icon}`}>{tierLabel(account.tierName, "Chưa có hạng")}</p>
          </div>
        </div>

        {/* Điểm + tiến độ + quyền lợi */}
        <div className="flex-1">
          <p className="flex items-baseline gap-2">
            <span className={`inline-flex items-center gap-1.5 text-2xl font-extrabold ${theme.icon}`}>
              <Sparkles size={20} /> {fmt(account.availablePoints)}
            </span>
            <span className="text-sm font-semibold text-muted-foreground">điểm khả dụng</span>
          </p>

          <div className="mt-3">
            {!progress.hasData ? (
              <p className="text-xs text-muted-foreground">Chưa có dữ liệu tiến độ lên hạng.</p>
            ) : progress.isMax ? (
              <p className={`inline-flex items-center gap-1.5 text-xs font-semibold ${theme.icon}`}>
                <Crown size={14} /> Bạn đang ở hạng cao nhất.
              </p>
            ) : (
              <>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted-foreground">
                    Còn <b className={theme.icon}>{fmt(progress.pointsToNext)}</b> điểm để lên hạng {tierLabel(progress.next.name)}
                  </span>
                  <span className="text-muted-foreground">{progress.progressPercent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-black/5">
                  <div className={`h-full rounded-full transition-all ${theme.bar}`} style={{ width: `${progress.progressPercent}%` }} />
                </div>
              </>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-black/5 bg-card/70 p-4 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Quyền lợi</p>
              <p className="text-sm font-semibold text-foreground">Tích điểm sau mỗi lần rửa</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Ưu đãi</p>
              <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                {hasDiscount ? (
                  <><BadgePercent size={14} className="text-success" /> Giảm {Number(account.tierDiscountPercentage)}% mỗi lần rửa</>
                ) : (
                  "Đổi điểm lấy ưu đãi"
                )}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => navigate("/khach-hang/diem-thanh-vien")}>Xem điểm thưởng</Button>
            <Button size="sm" variant="outline" onClick={() => navigate("/khach-hang/uu-dai")}>Ưu đãi dành cho bạn</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MembershipSummary;
