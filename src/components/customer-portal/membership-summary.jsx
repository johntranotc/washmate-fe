import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { loyaltyApi } from "@/api/loyaltyApi";
import { cn } from "@/lib/utils";
import { resolveTierInfo } from "@/lib/customer-engagement-data";
import { tiers as membershipTiers } from "@/lib/site-data";
import { TierBadge } from "@/components/site/tier-badge";

export function MembershipSummary() {
  const navigate = useNavigate();
  const [loyaltyInfo, setLoyaltyInfo] = useState(() => {
    const calc = resolveTierInfo(0);
    return {
      tierName: calc.tierName,
      availablePoints: 0,
      nextTierName: calc.nextTierName,
      pointsToNextTier: calc.pointsToNextTier,
      progressPercent: calc.progressPercent,
    };
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await loyaltyApi.getMyLoyalty();
        if (res) {
          const pts = Number(res.availablePoints ?? res.points ?? 0) || 0;
          const calc = resolveTierInfo(pts, res.tierName || res.tier || res.tierCode);

          setLoyaltyInfo({
            tierName: calc.tierName,
            availablePoints: pts,
            nextTierName: calc.nextTierName,
            pointsToNextTier: calc.pointsToNextTier,
            progressPercent: calc.progressPercent,
          });
        }
      } catch {
        // im lặng
      }
    }
    load();
  }, []);

  const currentTierObj = membershipTiers.find((t) => t.name.toLowerCase() === loyaltyInfo.tierName?.toLowerCase()) || membershipTiers[0];

  const getTierGradient = (tierName) => {
    switch (tierName?.toLowerCase()) {
      case "đồng":
      case "bronze":
        return "from-tier-bronze/20 via-card to-tier-bronze/5 border-tier-bronze/40";
      case "bạc":
      case "silver":
        return "from-neutral-muted/30 via-card to-border/10 border-border";
      case "vàng":
      case "gold":
        return "from-tier-gold/20 via-card to-tier-gold/5 border-tier-gold/50";
      case "bạch kim":
      case "platinum":
        return "from-accent-indigo/20 via-card to-accent-violet/10 border-accent-indigo/40";
      case "kim cương":
      case "diamond":
        return "from-accent-cyan/20 via-card to-primary/10 border-accent-cyan/40";
      default:
        return "from-primary/10 via-card to-primary/5 border-border";
    }
  };

  const getTierTextColor = (tierName) => {
    switch (tierName?.toLowerCase()) {
      case "đồng":
      case "bronze":
        return "text-tier-bronze-ink";
      case "bạc":
      case "silver":
        return "text-muted-foreground";
      case "vàng":
      case "gold":
        return "text-tier-gold-ink";
      case "bạch kim":
      case "platinum":
        return "text-accent-indigo";
      case "kim cương":
      case "diamond":
        return "text-accent-cyan";
      default:
        return "text-primary";
    }
  };

  return (
    <div className="mb-8">
      <Card className={cn("rounded-2xl border bg-gradient-to-br p-8", getTierGradient(loyaltyInfo.tierName))}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="flex flex-col items-center justify-center">
            <div className="mb-4 flex items-center justify-center">
              <TierBadge tier={currentTierObj} size="sm" />
            </div>
            <p className="text-center text-sm font-medium text-muted-foreground mt-2">Hạng hiện tại</p>
            <p className={cn("text-2xl font-extrabold leading-tight", getTierTextColor(loyaltyInfo.tierName))}>
              {loyaltyInfo.tierName}
            </p>
          </div>

          <div className="flex flex-col justify-center lg:col-span-2">
            <div className="mb-6">
              <div className="mb-1 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold leading-tight text-foreground">
                  {Number(loyaltyInfo.availablePoints || 0).toLocaleString("vi-VN")}
                </span>
                <span className="text-lg font-semibold text-muted-foreground">điểm</span>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Điểm thành viên hiện tại</p>
            </div>

            {loyaltyInfo.pointsToNextTier > 0 && (
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-muted-foreground">Tiến độ đến hạng {loyaltyInfo.nextTierName}</p>
                  <p className="text-sm font-extrabold text-primary">Cần thêm {loyaltyInfo.pointsToNextTier} điểm</p>
                </div>
                <Progress value={loyaltyInfo.progressPercent} className="h-2" />
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 shadow-sm">
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Quyền lợi</p>
                <p className="text-sm font-semibold leading-tight text-foreground">{currentTierObj.benefits?.[0] || "Tích điểm mỗi lần rửa xe"}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Ưu đãi</p>
                <p className="text-sm font-semibold leading-tight text-foreground">{currentTierObj.discount || "Đổi voucher giảm giá"}</p>
              </div>
            </div>

            <Button
              onClick={() => navigate("/khach-hang/diem-thanh-vien")}
              className="mt-6"
            >
              Xem điểm thưởng
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
