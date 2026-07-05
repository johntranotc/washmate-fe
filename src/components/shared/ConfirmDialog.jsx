import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

let requestConfirm = null;

/**
 * Thay thế window.confirm — trả Promise<boolean>, gọi được từ mọi handler:
 *   if (!(await confirmDialog({ title: "Xóa gara?", description: "...", destructive: true }))) return;
 * Yêu cầu <ConfirmDialogHost /> đã mount một lần trong main.jsx.
 */
export function confirmDialog({
  title,
  description = "",
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  destructive = false,
} = {}) {
  if (!requestConfirm) {
    return Promise.resolve(window.confirm([title, description].filter(Boolean).join("\n")));
  }
  return new Promise((resolve) => {
    requestConfirm({ title, description, confirmLabel, cancelLabel, destructive, resolve });
  });
}

export function ConfirmDialogHost() {
  const [request, setRequest] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    requestConfirm = (next) => {
      setRequest((prev) => {
        prev?.resolve(false);
        return next;
      });
      setOpen(true);
    };
    return () => {
      requestConfirm = null;
    };
  }, []);

  const settle = (accepted) => {
    request?.resolve(accepted);
    setOpen(false);
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) settle(false);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            {request?.destructive && (
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-critical-container text-critical">
                <AlertTriangle size={20} />
              </span>
            )}
            <div className="flex flex-col gap-1.5">
              <AlertDialogTitle>{request?.title}</AlertDialogTitle>
              {request?.description ? (
                <AlertDialogDescription>{request.description}</AlertDialogDescription>
              ) : null}
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => settle(false)}>{request?.cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            className={request?.destructive ? "bg-critical text-primary-foreground hover:bg-critical/90" : undefined}
            onClick={() => settle(true)}
          >
            {request?.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
