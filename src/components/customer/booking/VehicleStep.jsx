import { Car, CheckCircle2, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function VehicleStep({ vehicles, selectedId, onSelect }) {
  if (!vehicles.length) {
    return <div className="rounded-3xl border border-dashed border-[var(--border-soft)] bg-white p-10 text-center"><Car className="mx-auto size-10 text-[var(--brand-blue)]" /><h2 className="mt-4 text-xl font-extrabold">Bạn chưa có xe nào</h2><p className="mt-2 text-sm text-[var(--text-muted)]">Hãy thêm xe trước khi tạo lịch chăm sóc.</p><Link to="/khach-hang/xe-cua-toi" className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[var(--brand-blue)] px-5 py-3 text-sm font-bold text-white"><Plus size={17} /> Thêm xe mới</Link></div>;
  }
  return <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{vehicles.map((vehicle) => {
    const selected = String(selectedId) === String(vehicle.id);
    return <article key={vehicle.id} className={cn("relative rounded-3xl border-2 bg-white p-6 shadow-sm transition", selected ? "border-[var(--brand-blue)] shadow-[0_20px_45px_-28px_rgba(11,140,255,.7)]" : "border-[var(--border-soft)] hover:border-[var(--brand-blue)]/40")}><div className="flex items-start justify-between gap-4"><span className="grid size-12 place-items-center rounded-2xl bg-[var(--brand-blue)]/10 text-[var(--brand-blue)]"><Car /></span><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"><CheckCircle2 className="mr-1 inline size-3.5" />Đang hoạt động</span></div><h3 className="mt-5 text-xl font-extrabold">{vehicle.licensePlate}</h3><p className="mt-2 font-semibold">{[vehicle.brand, vehicle.model].filter(Boolean).join(" ") || "Thông tin xe"}</p><div className="mt-4 space-y-1 text-sm text-[var(--text-muted)]"><p>Màu xe: {vehicle.color}</p>{vehicle.type && <p>Loại xe: {vehicle.type}</p>}</div><button type="button" onClick={() => onSelect(vehicle)} className={cn("mt-6 w-full rounded-2xl px-4 py-3 text-sm font-bold transition", selected ? "bg-[var(--brand-blue)] text-white" : "bg-[var(--bg-main)] text-[var(--brand-blue)] hover:bg-[var(--brand-blue)] hover:text-white")}>{selected ? "Đã chọn xe" : "Chọn xe"}</button></article>;
  })}</div>;
}
