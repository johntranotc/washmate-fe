import { Quote, Star } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { testimonials } from "@/lib/site-data";

export function Testimonials() {
  return (
    <section className="bg-surface-tint pb-10 pt-16 lg:pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Khách hàng nói gì"
          title={
            <>
              Hàng nghìn chủ xe <span className="text-primary">tin tưởng WashMate</span>
            </>
          }
          description="Sự hài lòng của khách hàng là động lực để chúng tôi không ngừng nâng cao chất lượng dịch vụ."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <figure
              key={item.name}
              className="relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <Quote aria-hidden="true" className="absolute bottom-6 right-6 size-9 text-primary-container" />
              <div className="flex gap-1 text-primary" aria-label={`${item.rating} trên 5 sao`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="size-4"
                    fill={i < item.rating ? "currentColor" : "none"}
                    strokeWidth={i < item.rating ? 0 : 1.5}
                  />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-pretty text-sm leading-relaxed text-foreground/85">
                {`"${item.content}"`}
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                <img
                  src={item.avatar || "/placeholder.svg"}
                  alt={item.name}
                  className="size-11 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-bold text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Đã sử dụng: {item.service}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
