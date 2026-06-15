import { Clock3, MapPin, Phone } from "lucide-react";
import { getGarageId } from "@/lib/booking-flow";
import { cn } from "@/lib/utils";

export function GarageStep({ garages, selectedId, onSelect }) {
  if (!garages.length) return <div className="rounded-3xl border border-dashed border-[var(--border-soft)] bg-white p-10 text-center"><MapPin className="mx-auto size-10 text-[var(--brand-blue)]" /><h2 className="mt-4 text-xl font-extrabold">Không có gara</h2><p className="mt-2 text-sm text-[var(--text-muted)]">Không tìm thấy gara phù hợp với dịch vụ đã chọn.</p></div>;
  return <div className="grid gap-5 md:grid-cols-2">{garages.map((garage) => {
    const garageId = getGarageId(garage);
    const selected = String(selectedId) === String(garageId);
    return <article key={garageId || garage.name} className={cn("rounded-3xl border-2 bg-white p-6 shadow-sm transition", selected ? "border-[var(--brand-blue)]" : "border-[var(--border-soft)] hover:border-[var(--brand-blue)]/40")}><div className="flex items-start justify-between gap-4"><span className="grid size-12 place-items-center rounded-2xl bg-[var(--brand-blue)]/10 text-[var(--brand-blue)]"><MapPin /></span><div className="flex flex-wrap justify-end gap-2"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Đang hoạt động</span>{garage.isMock && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">Dữ liệu mẫu</span>}</div></div><h3 className="mt-5 text-xl font-extrabold">{garage.name}</h3><div className="mt-4 space-y-3 text-sm text-[var(--text-muted)]"><p className="flex gap-2"><MapPin size={17} className="shrink-0 text-[var(--brand-blue)]" />{garage.address}</p><p className="flex gap-2"><Phone size={17} className="shrink-0 text-[var(--brand-blue)]" />{garage.phone}</p><p className="flex gap-2"><Clock3 size={17} className="shrink-0 text-[var(--brand-blue)]" />{garage.openingHours}</p></div><button type="button" onClick={() => onSelect(garage)} className={cn("mt-6 w-full rounded-2xl px-4 py-3 text-sm font-bold", selected ? "bg-[var(--brand-blue)] text-white" : "bg-[var(--bg-main)] text-[var(--brand-blue)]")}>{selected ? "Đã chọn gara" : "Chọn gara"}</button></article>;
  })}</div>;
}
