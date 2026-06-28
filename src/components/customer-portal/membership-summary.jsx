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
        return "from-[#B07B4F]/20 via-white to-[#B07B4F]/5 border-[#B07B4F]/40";
      case "bạc":
      case "silver":
        return "from-slate-300/30 via-white to-slate-200/10 border-slate-300";
      case "vàng":
      case "gold":
        return "from-[#FFD700]/20 via-white to-[#FFA500]/5 border-[#FFD700]/50";
      case "bạch kim":
      case "platinum":
        return "from-indigo-200/30 via-white to-purple-200/10 border-indigo-300";
      case "kim cương":
      case "diamond":
        return "from-cyan-200/30 via-white to-blue-200/10 border-cyan-300";
      default:
        return "from-primary/10 via-white to-primary/5 border-border";
    }
  };

  const getTierTextColor = (tierName) => {
    switch (tierName?.toLowerCase()) {
      case "đồng":
      case "bronze":
        return "text-[#8C5A32]";
      case "bạc":
      case "silver":
        return "text-slate-500";
      case "vàng":
      case "gold":
        return "text-[#B8860B]";
      case "bạch kim":
      case "platinum":
        return "text-indigo-600";
      case "kim cương":
      case "diamond":
        return "text-cyan-600";
      default:
        return "text-primary";
    }
  };

  return (
    <div className="mb-8">
      <Card className={cn("rounded-3xl border bg-gradient-to-br p-8", getTierGradient(loyaltyInfo.tierName))}>
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

            <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-white/60 p-4 backdrop-blur sm:grid-cols-2 shadow-sm">
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
              className="mt-6 rounded-xl bg-primary font-bold text-primary-foreground hover:bg-brand-dark"
            >
              Xem điểm thưởng
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
