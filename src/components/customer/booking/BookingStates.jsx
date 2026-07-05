import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StepLoading() {
  return <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center"><Loader2 className="size-8 animate-spin text-primary" /><strong className="mt-4 text-foreground">Đang tải dữ liệu...</strong><span className="mt-1 text-sm text-muted-foreground">WashMate đang chuẩn bị các lựa chọn phù hợp.</span></div>;
}

export function StepError({ message, onRetry }) {
  return <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-critical/25 bg-critical-container p-8 text-center"><span className="grid size-12 place-items-center rounded-2xl bg-card text-critical"><AlertCircle /></span><strong className="mt-4 text-critical">Không thể tải dữ liệu</strong><span className="mt-1 text-sm text-critical">{message}</span><Button onClick={onRetry} className="mt-5 bg-critical text-white hover:bg-critical/90">Thử lại</Button></div>;
}
