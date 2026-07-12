import { useEffect, useRef, useState } from "react";
import { BadgePercent, CalendarDays, Clock3, LayoutGrid, RefreshCw, Sparkles, Star } from "lucide-react";
import { LinkButton } from "@/components/site/link-button";

const trustItems = [
  [Clock3, "30 giây đặt lịch", "Nhanh chóng, tiện lợi"],
  [RefreshCw, "Theo dõi thời gian thực", "Cập nhật tiến độ tức thì"],
  [Star, "Tích điểm tự động", "Càng dùng càng nhiều ưu đãi"],
  [BadgePercent, "Ưu đãi thành viên", "Nhiều quyền lợi hấp dẫn"],
];

export function Hero() {
  // Chữ trượt vào từ phải; chạy LẠI mỗi lần khối chữ cuộn vào tầm nhìn.
  const textRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return undefined;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setInView(true);
      return undefined;
    }
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const inClass = inView ? "is-in" : "";

  return (
    <>
      {/* -mt-19 = chiều cao header để ảnh hero tràn lên sau navbar. Hero editorial:
          ảnh full-bleed (ảnh dọc, tông tối), scrim ĐEN trung tính trái→phải cho chữ nổi. */}
      <section className="relative isolate -mt-19 flex min-h-[100dvh] overflow-hidden bg-navy-deep">
        {/* Ảnh phủ KÍN khung, hai lề luôn là ảnh thật; canh xuống ~72% để chiếc xe lọt trọn, không cắt */}
        <img
          src="/images/home/02_hero/home_hero_desktop.png"
          alt=""
          aria-hidden="true"
          className="wm-kenburns absolute inset-0 size-full object-cover object-[50%_72%]"
        />

        {/* Vệt tối TRUNG TÍNH (không xanh) bên trái sau chữ + đáy tối nhẹ cho CTA nổi */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(8,11,18,0.86)_0%,rgba(8,11,18,0.5)_28%,rgba(8,11,18,0.12)_52%,transparent_72%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(to_top,rgba(8,11,18,0.55),transparent)]"
        />

        <div className="relative mx-auto flex w-full max-w-7xl items-center px-4 pb-20 pt-24 sm:px-6 lg:px-8">
          <div ref={textRef} className="max-w-2xl">
            <span className={`wm-slide-in ${inClass} inline-flex items-center gap-2 rounded-full border border-white/20 bg-navy/50 px-4 py-2 text-sm font-bold text-primary-bright backdrop-blur`}>
              Chăm sóc xe cùng WashMate
            </span>

            <h1 className={`wm-slide-in ${inClass} mt-6 text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl`} style={{ transitionDelay: "250ms" }}>
              Rửa xe thông minh,
              <br className="hidden sm:block" /> chăm sóc xe{" "}
              <span className="text-primary-bright">an tâm</span>.
            </h1>

            <p className={`wm-slide-in ${inClass} mt-6 max-w-xl text-pretty text-lg leading-relaxed text-white/80`} style={{ transitionDelay: "600ms" }}>
              Đặt lịch, thanh toán, theo dõi tiến độ và tích điểm thành viên
              trên cùng một nền tảng.
            </p>

            <div className={`wm-slide-in ${inClass} mt-9 flex w-full max-w-sm flex-col gap-3.5 sm:w-auto sm:max-w-none sm:flex-row`} style={{ transitionDelay: "950ms" }}>
              <LinkButton href="/register" size="xl">
                <CalendarDays className="size-4.5" />
                Đặt lịch ngay
              </LinkButton>
              <LinkButton href="/services" variant="ghostWhite" size="xl">
                <LayoutGrid className="size-4.5" />
                Xem dịch vụ
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      {/* Băng tin cậy — tách khỏi hero, đứng thành dải nội dung đầu tiên dưới poster */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-y-6 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:gap-y-0 lg:divide-x lg:divide-border lg:px-8">
          {trustItems.map(([Icon, title, sub]) => (
            <div key={title} className="flex items-center gap-4 lg:justify-center lg:px-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary-container text-primary">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="font-bold text-foreground">{title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
