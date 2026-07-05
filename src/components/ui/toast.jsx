import { Toast } from "@base-ui/react/toast";
import { CheckCircle2, Info, XCircle, X } from "lucide-react";

import { cn } from "@/lib/utils";

const toastManager = Toast.createToastManager();

/**
 * API dạng sonner: toast.success("Đã lưu"), toast.error("Thất bại", { description }).
 * Dùng được cả ngoài React component (service, interceptor...).
 */
export const toast = {
  success: (title, opts = {}) => toastManager.add({ type: "success", title, ...opts }),
  error: (title, opts = {}) => toastManager.add({ type: "error", title, priority: "high", ...opts }),
  info: (title, opts = {}) => toastManager.add({ type: "info", title, ...opts }),
};

const TYPE_STYLES = {
  success: { icon: CheckCircle2, iconClass: "text-success", barClass: "bg-success" },
  error: { icon: XCircle, iconClass: "text-critical", barClass: "bg-critical" },
  info: { icon: Info, iconClass: "text-primary", barClass: "bg-primary" },
};

function ToastList() {
  const { toasts } = Toast.useToastManager();
  return toasts.map((toastItem) => {
    const { icon: Icon, iconClass, barClass } = TYPE_STYLES[toastItem.type] ?? TYPE_STYLES.info;
    return (
      <Toast.Root
        key={toastItem.id}
        toast={toastItem}
        className={cn(
          "pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-2xl border border-border bg-popover py-3 pl-4 pr-10 shadow-floating",
          "transition-all duration-200 data-[ending-style]:translate-x-4 data-[ending-style]:opacity-0 data-[starting-style]:translate-y-2 data-[starting-style]:opacity-0",
        )}
      >
        <span className={cn("absolute inset-y-0 left-0 w-1", barClass)} aria-hidden="true" />
        <Icon size={18} className={cn("mt-0.5 shrink-0", iconClass)} />
        <div className="min-w-0">
          <Toast.Title className="text-sm font-semibold text-foreground" />
          <Toast.Description className="mt-0.5 text-sm text-muted-foreground" />
        </div>
        <Toast.Close
          aria-label="Đóng thông báo"
          className="absolute right-2 top-2 rounded-md p-1 text-neutral-muted transition-colors hover:bg-muted hover:text-foreground"
        >
          <X size={14} />
        </Toast.Close>
      </Toast.Root>
    );
  });
}

/** Bọc quanh app trong main.jsx — provider + viewport góc phải trên. */
export function ToastHost({ children }) {
  return (
    <Toast.Provider toastManager={toastManager} timeout={5000} limit={3}>
      {children}
      <Toast.Portal>
        <Toast.Viewport className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(380px,calc(100vw-2rem))] flex-col-reverse gap-2">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}
