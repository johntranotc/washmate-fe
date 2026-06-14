import { Star } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { testimonials } from "@/lib/site-data";

export function Testimonials() {
  return (
    <section className="bg-secondary/40 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow="Khách hàng nói gì"
          title="Hàng nghìn chủ xe tin tưởng SparkleAI"
          description="Sự hài lòng của khách hàng là thước đo chất lượng dịch vụ của chúng tôi."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <figure
              key={item.name}
              className="flex flex-col rounded-3xl border border-border bg-card p-7 shadow-sm"
            >
              <div className="flex gap-1 text-accent" aria-label={`${item.rating} trên 5 sao`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="size-4"
                    fill={i < item.rating ? "currentColor" : "none"}
                    strokeWidth={i < item.rating ? 0 : 1.5}
                  />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-pretty leading-relaxed text-foreground/80">
                {`"${item.content}"`}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                <img
                  src={item.avatar || "/placeholder.svg"}
                  alt={item.name}
                  className="size-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.service}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
