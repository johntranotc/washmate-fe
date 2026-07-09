import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import { resolveTierInfo } from "@/lib/customer-engagement-data";
import { tiers as membershipTiers } from "@/lib/site-data";
import { TierBadge } from "@/components/site/tier-badge";

const TIER_GRADIENTS = {
  "đồng": "from-tier-bronze/20 via-card to-tier-bronze/5 border-tier-bronze/40",
  "bạc": "from-neutral-muted/30 via-card to-border/10 border-border",
  "vàng": "from-tier-gold/20 via-card to-tier-gold/5 border-tier-gold/50",
  "bạch kim": "from-accent-indigo/20 via-card to-accent-violet/10 border-accent-indigo/40",
  "kim cương": "from-accent-cyan/20 via-card to-primary/10 border-accent-cyan/40",
};

const TIER_TEXT = {
  "đồng": "text-tier-bronze-ink",
  "bạc": "text-muted-foreground",
  "vàng": "text-tier-gold-ink",
  "bạch kim": "text-accent-indigo",
  "kim cương": "text-accent-cyan",
};

/**
 * Điểm thành viên — loyalty thật từ trang (GET loyalty/me).
 * Chưa có tài khoản loyalty (null) → empty state, không bịa 0 điểm/hạng Đồng.
 * Ngưỡng hạng/quyền lợi lấy từ cấu hình nghiệp vụ của team (TIER_CONFIG/site-data).
 */
export function MembershipSummary({ loyalty = null }) {
  const navigate = useNavigate();

  if (!loyalty) {
    return (
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-lg font-bold text-foreground">Điểm thành viên</h2>
        <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-10 text-center">
          <Star size={36} className="text-border" />
          <p className="mt-3 text-sm font-semibold text-foreground">Bạn chưa có điểm thưởng</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Điểm sẽ được tích lũy sau mỗi lần rửa xe hoàn tất.
          </p>
          <Button size="sm" className="mt-4" onClick={() => navigate("/khach-hang/dat-lich-moi")}>
            Đặt lịch rửa xe
          </Button>
        </div>
      </section>
    );
  }

  const points = Number(loyalty.availablePoints ?? loyalty.points ?? 0) || 0;
  const calc = resolveTierInfo(points, loyalty.tierName || loyalty.tier || loyalty.tierCode);
  const tierKey = calc.tierName?.toLowerCase();
  const currentTierObj =
    membershipTiers.find((t) => t.name.toLowerCase() === tierKey) || membershipTiers[0];

  return (
    <Card className={cn("rounded-2xl border bg-gradient-to-br p-6", TIER_GRADIENTS[tierKey] || "from-primary/10 via-card to-primary/5 border-border")}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col items-center justify-center">
          <TierBadge tier={currentTierObj} size="sm" />
          <p className="mt-3 text-center text-xs font-semibold text-muted-foreground">Hạng hiện tại</p>
          <p className={cn("text-xl font-semibold leading-tight", TIER_TEXT[tierKey] || "text-primary")}>
            {calc.tierName}
          </p>
        </div>

        <div className="flex flex-col justify-center lg:col-span-2">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold leading-tight text-foreground">
                {formatNumber(points)}
              </span>
              <span className="text-sm font-semibold text-muted-foreground">điểm khả dụng</span>
            </div>
          </div>

          {calc.pointsToNextTier > 0 && (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  Tiến độ đến hạng {calc.nextTierName}
                </p>
                <p className="text-xs font-bold text-primary">Cần thêm {formatNumber(calc.pointsToNextTier)} điểm</p>
              </div>
              <Progress value={calc.progressPercent} className="h-2" />
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Quyền lợi</p>
              <p className="text-sm font-semibold leading-tight text-foreground">
                {currentTierObj.benefits?.[0] || "Tích điểm mỗi lần rửa xe"}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Ưu đãi</p>
              <p className="text-sm font-semibold leading-tight text-foreground">
                {currentTierObj.discount || "Đổi voucher giảm giá"}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => navigate("/khach-hang/diem-thanh-vien")}>
              Xem điểm thưởng
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate("/khach-hang/uu-dai")}>
              Ưu đãi dành cho bạn
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
