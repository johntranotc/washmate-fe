import { Clock3, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/booking-flow";
import { cn } from "@/lib/utils";

export function ServiceStep({ services, selectedId, onSelect }) {
  if (!services.length) return <Empty title="Không có dịch vụ" description="Hiện chưa có gói dịch vụ đang hoạt động." />;
  return <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{services.map((service) => {
    const selected = String(selectedId) === String(service.id);
    return <article key={service.id} className={cn("flex flex-col rounded-3xl border-2 bg-white p-6 shadow-sm transition", selected ? "border-[var(--brand-blue)]" : "border-[var(--border-soft)] hover:border-[var(--brand-blue)]/40")}><div className="flex items-center justify-between gap-3"><span className="grid size-12 place-items-center rounded-2xl bg-[var(--brand-blue)]/10 text-[var(--brand-blue)]"><Sparkles /></span>{service.badge && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">{service.badge}</span>}</div><h3 className="mt-5 text-xl font-extrabold">{service.name}</h3><p className="mt-2 flex-1 text-sm leading-6 text-[var(--text-muted)]">{service.description}</p><div className="mt-5 flex items-end justify-between"><strong className="text-xl text-[var(--brand-blue)]">{formatCurrency(service.price)}</strong><span className="flex items-center gap-1 text-xs font-semibold text-[var(--text-muted)]"><Clock3 size={15} /> {service.duration || "Đang cập nhật"} phút</span></div><button type="button" onClick={() => onSelect(service)} className={cn("mt-6 rounded-2xl px-4 py-3 text-sm font-bold", selected ? "bg-[var(--brand-blue)] text-white" : "bg-[var(--bg-main)] text-[var(--brand-blue)]")}>{selected ? "Đã chọn dịch vụ" : "Chọn dịch vụ"}</button></article>;
  })}</div>;
}

function Empty({ title, description }) {
  return <div className="rounded-3xl border border-dashed border-[var(--border-soft)] bg-white p-10 text-center"><Sparkles className="mx-auto size-10 text-[var(--brand-blue)]" /><h2 className="mt-4 text-xl font-extrabold">{title}</h2><p className="mt-2 text-sm text-[var(--text-muted)]">{description}</p></div>;
}
