import { cn } from "@/lib/utils";

/**
 * Header chuẩn cho mọi page: eyebrow + h1 + mô tả bên trái, actions bên phải.
 * Đây là nơi DUY NHẤT định nghĩa cỡ chữ page-title — không tự viết h1 trong page.
 */
export function PageHeader({ eyebrow, title, description, actions, className }) {
  return (
    <header className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        {eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
        ) : null}
        <h1 className={cn("text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl", eyebrow && "mt-2")}>
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">{actions}</div> : null}
    </header>
  );
}

export default PageHeader;
