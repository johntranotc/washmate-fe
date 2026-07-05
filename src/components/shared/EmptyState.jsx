import { cn } from "@/lib/utils";

/**
 * Trạng thái rỗng chuẩn cho list/table/section.
 * Props: icon (component lucide), title, description, action (nút/link tùy chọn).
 */
export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center",
        className,
      )}
    >
      {Icon ? (
        <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary-container text-primary">
          <Icon size={20} />
        </span>
      ) : null}
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
