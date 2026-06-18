import { History, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { loyaltyTransactionLabels } from "@/lib/customer-engagement-data";

export function PointsHistoryList({ transactions, loading }) {
  return (
    <Card className="rounded-3xl border border-border p-6">
      <div className="flex items-center gap-2">
        <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary"><History size={18} /></span>
        <h2 className="text-lg font-extrabold text-foreground">Lịch sử điểm</h2>
      </div>
      {loading ? (
        <p className="py-10 text-center text-sm font-medium text-muted-foreground">Đang tải lịch sử điểm...</p>
      ) : transactions.length === 0 ? (
        <p className="py-10 text-center text-sm font-medium text-muted-foreground">Chưa có giao dịch điểm nào.</p>
      ) : (
        <div className="mt-4 divide-y divide-border">
          {transactions.map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Sparkles size={16} /></span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <b className="text-sm font-semibold text-foreground">{item.description}</b>
                  <span className="rounded-full bg-secondary px-2 py-1 text-[9px] font-bold text-secondary-foreground">
                    {loyaltyTransactionLabels[item.type] || item.type}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">{new Date(item.createdAt).toLocaleString("vi-VN")}</p>
              </div>
              <strong className={item.points >= 0 ? "text-green-600" : "text-red-600"}>
                {item.points > 0 ? "+" : ""}{item.points.toLocaleString("vi-VN")}
              </strong>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
