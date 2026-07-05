import { Car, CheckCircle2, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function VehicleStep({ vehicles, selectedId, onSelect }) {
  if (!vehicles.length) {
    return <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center"><Car className="mx-auto size-10 text-primary" /><h2 className="mt-4 text-xl font-extrabold text-foreground">Bạn chưa có xe nào</h2><p className="mt-2 text-sm text-muted-foreground">Hãy thêm xe trước khi tạo lịch chăm sóc.</p><Button size="lg" className="mt-6" render={<Link to="/khach-hang/xe-cua-toi" />}><Plus /> Thêm xe mới</Button></div>;
  }
  return <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{vehicles.map((vehicle) => {
    const selected = String(selectedId) === String(vehicle.id);
    return <article key={vehicle.id} className={cn("relative rounded-2xl border-2 bg-card p-6 shadow-sm transition", selected ? "border-primary shadow-cta" : "border-border hover:border-primary/40")}><div className="flex items-start justify-between gap-4"><span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Car /></span><span className="rounded-full bg-success-container px-3 py-1 text-xs font-bold text-success"><CheckCircle2 className="mr-1 inline size-3.5" />Đang hoạt động</span></div><h3 className="mt-5 text-xl font-extrabold text-foreground">{vehicle.licensePlate}</h3><p className="mt-2 font-semibold text-foreground">{[vehicle.brand, vehicle.model].filter(Boolean).join(" ") || "Thông tin xe"}</p><div className="mt-4 space-y-1 text-sm text-muted-foreground"><p>Màu xe: {vehicle.color}</p>{vehicle.type && <p>Loại xe: {vehicle.type}</p>}</div><button type="button" onClick={() => onSelect(vehicle)} className={cn("mt-6 w-full rounded-2xl px-4 py-3 text-sm font-bold transition", selected ? "bg-primary text-primary-foreground" : "bg-muted text-primary hover:bg-primary hover:text-primary-foreground")}>{selected ? "Đã chọn xe" : "Chọn xe"}</button></article>;
  })}</div>;
}
