import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { formatNumber } from "@/lib/format";

/**
 * Drawer chi tiết hạng thành viên. Mốc điểm/mức giảm là cấu hình nghiệp vụ
 * của hệ thống; số khách thuộc hạng và lịch sử chỉnh sửa chưa có API admin
 * → empty state, không bịa số liệu.
 * tier: { name, points, discount, image }
 */
export function AdminTierDrawer({ tier, open, onOpenChange }) {
  if (!tier) return null;

  const rows = [
    ["Điểm tối thiểu", `${formatNumber(tier.points)} điểm`],
    ["Mức giảm giá", `${tier.discount}% mọi dịch vụ`],
    ["Điều kiện nâng hạng", `Tích lũy đủ ${formatNumber(tier.points)} điểm`],
    ["Trạng thái", "Đang áp dụng"],
  ];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[85vh] overflow-y-auto">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {tier.image && <img src={tier.image} alt="" className="h-12 w-12 shrink-0 object-contain" />}
            <div>
              <AlertDialogTitle>Hạng {tier.name}</AlertDialogTitle>
              <AlertDialogDescription>Chi tiết hạng thành viên</AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <dl className="mt-4 space-y-2 rounded-xl border border-border bg-surface p-4">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-4 text-sm">
              <dt className="shrink-0 text-muted-foreground">{label}</dt>
              <dd className="text-right font-bold text-foreground">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-3 rounded-xl border border-border p-4">
          <p className="text-xs font-bold text-foreground">Quyền lợi</p>
          <ul className="mt-1 space-y-1">
            <li className="text-sm leading-6 text-muted-foreground">
              • Giảm {tier.discount}% cho mọi dịch vụ rửa xe khi đặt lịch.
            </li>
            <li className="text-sm leading-6 text-muted-foreground">
              • Tích điểm cho mỗi booking hoàn tất để duy trì và nâng hạng.
            </li>
          </ul>
        </div>

        {/* BE chưa có API đếm khách theo hạng / lịch sử chỉnh sửa */}
        <div className="mt-3 rounded-xl border border-dashed border-border p-4">
          <p className="text-xs font-bold text-foreground">Số khách thuộc hạng</p>
          <p className="mt-1 text-xs text-neutral-muted">Chưa có dữ liệu từ hệ thống.</p>
        </div>
        <div className="mt-3 rounded-xl border border-dashed border-border p-4">
          <p className="text-xs font-bold text-foreground">Lịch sử chỉnh sửa</p>
          <p className="mt-1 text-xs text-neutral-muted">Chưa có lịch sử chỉnh sửa.</p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Đóng</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
