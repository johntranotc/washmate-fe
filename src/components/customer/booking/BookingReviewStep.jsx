import { AlertTriangle, CalendarDays, Car, MapPin, Sparkles } from "lucide-react";
import { formatCurrency, formatDate, getGarageId } from "@/lib/booking-flow";

export function BookingReviewStep({ selection, note, onNoteChange }) {
  const { vehicle, service, garage, date, slot } = selection;
  const items = [
    { icon: Car, title: "Thông tin xe", lines: [vehicle.licensePlate, [vehicle.brand, vehicle.model].filter(Boolean).join(" "), `Màu xe: ${vehicle.color}`] },
    { icon: Sparkles, title: "Thông tin dịch vụ", lines: [service.name, formatCurrency(service.price), `Thời gian dự kiến: ${service.duration || "Đang cập nhật"} phút`] },
    { icon: MapPin, title: "Thông tin gara", lines: [garage.name, garage.address], debug: `Mã gara: ${getGarageId(garage) || "Không hợp lệ"}` },
    { icon: CalendarDays, title: "Thông tin lịch", lines: [formatDate(date), `${slot.startTime} - ${slot.endTime || "Đang cập nhật"}`] },
  ];
  return <div className="grid gap-6 xl:grid-cols-[1fr_360px]"><div className="grid gap-4 md:grid-cols-2">{items.map(({ icon: Icon, title, lines, debug }) => <article key={title} className="rounded-3xl border border-border bg-card p-6 shadow-sm"><span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon size={21} /></span><h3 className="mt-4 font-extrabold text-foreground">{title}</h3><div className="mt-3 space-y-1 text-sm text-muted-foreground">{lines.filter(Boolean).map((line) => <p key={line}>{line}</p>)}</div>{debug && <p className="mt-3 inline-flex rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground">{debug}</p>}</article>)}</div><aside className="rounded-3xl border border-border bg-card p-6 shadow-sm"><label className="text-sm font-bold text-foreground">Ghi chú cho gara<textarea value={note} onChange={(event) => onNoteChange(event.target.value)} rows={6} placeholder="Ví dụ: xe có vết bẩn ở bánh trước, cần vệ sinh kỹ nội thất..." className="mt-3 w-full resize-none rounded-2xl border border-border bg-muted p-4 text-sm font-normal text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" /></label><div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800"><AlertTriangle className="mt-0.5 size-5 shrink-0" /><p>Lịch đặt sẽ được tạo ở trạng thái <strong>Chờ thanh toán</strong>. Lịch chỉ được xác nhận sau khi thanh toán thành công.</p></div></aside></div>;
}
