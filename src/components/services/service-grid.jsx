import { useState } from "react";
import { ServiceCard } from "@/components/site/service-card";
import { services, serviceCategories } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function ServiceGrid() {
  const [active, setActive] = useState("Tất cả");

  const filtered = active === "Tất cả" ? services : services.filter((s) => s.category === active);

  return (
    <div>
      <div className="flex flex-wrap gap-2.5">
        {serviceCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActive(cat)}
            className={cn(
              "rounded-full px-4 py-2 text-[14px] font-semibold transition-all",
              active === cat
                ? "bg-primary text-primary-foreground shadow-[0_10px_24px_-12px_rgba(11,140,255,0.9)]"
                : "border border-border bg-card text-foreground hover:border-primary hover:text-primary",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <ServiceCard key={s.slug} service={s} showBook />
        ))}
      </div>
    </div>
  );
}
