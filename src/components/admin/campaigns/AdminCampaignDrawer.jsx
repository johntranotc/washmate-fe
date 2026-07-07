import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { formatDate, formatMoney, formatNumber, friendlyName } from "@/lib/format";

/**
 * Drawer chi tiết chiến dịch — toàn bộ từ dữ liệu promotion thật của BE
 * (GET /v1/promotion/manage/all). BE chưa có API booking áp dụng mã, doanh thu
 * theo chiến dịch, lịch sử chỉnh sửa, giới hạn theo khách → empty state, không bịa.
 * campaign: promotion đã enrich { ..., garageName, derived: {label, tone}, attention: [] }
 */
export function AdminCampaignDrawer({ campaign, open, onOpenChange }) {
  if (!campaign) return null;

  const isPercent = campaign.discountType === "PERCENTAGE";
  const valueLabel = isPercent
    ? `Giảm ${campaign.discountValue}%`
    : `Giảm ${formatMoney(campaign.discountValue)}`;

  const rows = [
    ["Mã ưu đãi", campaign.code || "Chưa có thông tin"],
    ["Loại ưu đãi", isPercent ? "Giảm theo %" : "Giảm số tiền"],
    ["Giá trị giảm", valueLabel],
    ...(isPercent && campaign.maxDiscount > 0 ? [["Giảm tối đa", formatMoney(campaign.maxDiscount)]] : []),
    ["Điều kiện sử dụng", campaign.minOrderValue > 0 ? `Đơn tối thiểu ${formatMoney(campaign.minOrderValue)}` : "Không yêu cầu đơn tối thiểu"],
    ["Thời gian hiệu lực", `${formatDate(campaign.startDate)} – ${formatDate(campaign.endDate)}`],
    ["Chi nhánh áp dụng", friendlyName(campaign.garageName, "Chi nhánh chưa cập nhật")],
    ["Giới hạn lượt dùng", campaign.usageLimit > 0 ? formatNumber(campaign.usageLimit) : "Không giới hạn"],
    ["Lượt đã sử dụng", formatNumber(campaign.usedCount || 0)],
  ];

  const pct = campaign.usageLimit > 0
    ? Math.min(100, Math.round(((campaign.usedCount || 0) / campaign.usageLimit) * 100))
    : null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[85vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>{campaign.title}</AlertDialogTitle>
          <AlertDialogDescription>Chi tiết chiến dịch</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${campaign.derived.tone}`}>
            {campaign.derived.label}
          </span>
          {campaign.attention.map((a) => (
            <span key={a} className="rounded-full bg-warning-container px-2.5 py-0.5 text-xs font-bold text-warning">
              {a}
            </span>
          ))}
        </div>

        <dl className="mt-4 space-y-2 rounded-xl border border-border bg-surface p-4">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-4 text-sm">
              <dt className="shrink-0 text-muted-foreground">{label}</dt>
              <dd className="text-right font-semibold text-foreground">{value}</dd>
            </div>
          ))}
          {pct != null && (
            <div className="pt-1">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${pct >= 90 ? "bg-warning" : "bg-primary"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-1 text-right text-xs text-neutral-muted">{pct}% lượt dùng</p>
            </div>
          )}
        </dl>

        {/* BE chưa có API cho các phần dưới — hiển thị trung thực */}
        {[
          "Booking đã áp dụng",
          "Doanh thu liên quan",
          "Giới hạn theo khách hàng",
          "Lịch sử chỉnh sửa",
        ].map((label) => (
          <div key={label} className="mt-3 rounded-xl border border-dashed border-border p-4">
            <p className="text-xs font-bold text-foreground">{label}</p>
            <p className="mt-1 text-xs text-neutral-muted">Chưa có dữ liệu.</p>
          </div>
        ))}

        <AlertDialogFooter>
          <AlertDialogCancel>Đóng</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
