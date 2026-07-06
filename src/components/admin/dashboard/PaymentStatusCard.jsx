import { formatNumber } from "@/lib/format";

/**
 * "Tình trạng thanh toán" — 4 chỉ số đếm từ payment status thật gắn trên booking
 * (BE chưa có API list payments toàn hệ thống; đây là dữ liệu payment thật
 * nhúng trong BookingResponse, trong phạm vi bộ lọc hiện tại).
 */
export function PaymentStatusCard({ paid = 0, pending = 0, failed = 0, refunded = 0 }) {
  const items = [
    { label: "Đã thanh toán", value: paid, cls: "text-success", bg: "bg-success-container" },
    { label: "Chờ thanh toán", value: pending, cls: "text-warning", bg: "bg-warning-container" },
    { label: "Thất bại / cần đối soát", value: failed, cls: "text-critical", bg: "bg-critical-container" },
    { label: "Đã hoàn tiền", value: refunded, cls: "text-primary-strong", bg: "bg-primary-container" },
  ];

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-lg font-bold text-foreground">Tình trạng thanh toán</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {items.map(({ label, value, cls, bg }) => (
          <div key={label} className={`rounded-xl p-3.5 ${bg}`}>
            <b className={`block text-xl font-bold ${cls}`}>{formatNumber(value)}</b>
            <span className={`mt-0.5 block text-xs font-semibold leading-4 ${cls}`}>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
