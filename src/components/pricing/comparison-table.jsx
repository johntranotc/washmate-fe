import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const rows = [
  { feature: "Rửa ngoại thất", values: [true, true, true] },
  { feature: "Làm sạch kính & gương", values: [true, true, true] },
  { feature: "Vệ sinh nội thất", values: [false, "Cơ bản", "Chuyên sâu"] },
  { feature: "Làm sạch thảm & ghế", values: [false, true, true] },
  { feature: "Khử mùi khoang xe", values: [false, "Nhẹ", "Cao cấp"] },
  { feature: "Phủ bóng bảo vệ", values: [false, false, true] },
  { feature: "Ưu tiên đặt lịch", values: [false, false, true] },
  { feature: "Tích điểm thành viên", values: ["x1", "x1", "x2"] },
];

const plans = ["Gói Cơ Bản", "Gói Tiêu Chuẩn", "Gói Cao Cấp"];

function Cell({ value }) {
  if (value === true)
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-secondary text-primary">
        <Check className="size-4" strokeWidth={3} />
      </span>
    );
  if (value === false)
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Minus className="size-4" />
      </span>
    );
  return <span className="text-[14px] font-semibold text-foreground">{value}</span>;
}

export function ComparisonTable() {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_18px_44px_-30px_rgba(16,32,51,0.4)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="px-6 py-5 text-[15px] font-bold text-foreground">Tính năng</th>
              {plans.map((p, i) => (
                <th
                  key={p}
                  className={cn(
                    "px-6 py-5 text-center text-[15px] font-bold",
                    i === 2 ? "text-primary" : "text-foreground",
                  )}
                >
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={row.feature} className={cn("border-b border-border last:border-0", ri % 2 === 1 && "bg-surface/50")}>
                <td className="px-6 py-4 text-[15px] font-medium text-foreground">{row.feature}</td>
                {row.values.map((v, i) => (
                  <td key={i} className="px-6 py-4 text-center">
                    <Cell value={v} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
