import { Clock3, Droplets } from "lucide-react";
import { formatCurrency } from "@/lib/booking-flow";
import { cn } from "@/lib/utils";

export function ServiceStep({ services, selectedId, onSelect, garageName }) {
  if (!services.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
        <Droplets className="mx-auto size-10 text-primary" />
        <h2 className="mt-4 text-xl font-extrabold text-foreground">
          Không có dịch vụ
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {garageName
            ? `Gara ${garageName} hiện chưa có dịch vụ khả dụng.`
            : "Hiện chưa có gói dịch vụ đang hoạt động."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {garageName && (
        <p className="text-sm font-semibold text-muted-foreground">
          Dịch vụ tại <strong className="text-primary">{garageName}</strong>
        </p>
      )}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => {
          const selected = String(selectedId) === String(service.id);
          return (
            <article
              key={service.id}
              className={cn(
                "flex flex-col rounded-2xl border-2 bg-card p-6 shadow-sm transition",
                selected ? "border-primary" : "border-border hover:border-primary/40",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Droplets />
                </span>
                <div className="flex flex-wrap justify-end gap-1.5">
                  {service.recommended && (
                    <span className="rounded-full bg-success-container px-2.5 py-1 text-xs font-extrabold text-success">
                      Đề xuất
                    </span>
                  )}
                  {service.badge && (
                    <span className="rounded-full bg-warning-container px-2.5 py-1 text-xs font-extrabold text-warning">
                      {service.badge}
                    </span>
                  )}
                </div>
              </div>
              <h3 className="mt-5 text-xl font-extrabold text-foreground">
                {service.name}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
                {service.description}
              </p>
              <div className="mt-5 flex items-end justify-between">
                <strong className="text-xl text-primary">
                  {formatCurrency(service.price)}
                </strong>
                <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  <Clock3 size={16} /> {service.duration || "—"} phút
                </span>
              </div>
              <button
                type="button"
                onClick={() => onSelect(service)}
                className={cn(
                  "mt-6 rounded-2xl px-4 py-3 text-sm font-bold",
                  selected ? "bg-primary text-primary-foreground" : "bg-muted text-primary",
                )}
              >
                {selected ? "✓ Đã chọn dịch vụ" : "Chọn dịch vụ"}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
