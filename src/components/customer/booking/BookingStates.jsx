import { AlertCircle, Loader2 } from "lucide-react";

export function StepLoading() {
  return <div className="flex min-h-56 flex-col items-center justify-center rounded-3xl border border-border bg-card p-8 text-center"><Loader2 className="size-8 animate-spin text-primary" /><strong className="mt-4 text-foreground">Đang tải dữ liệu...</strong><span className="mt-1 text-sm text-muted-foreground">WashMate đang chuẩn bị các lựa chọn phù hợp.</span></div>;
}

export function StepError({ message, onRetry }) {
  return <div className="flex min-h-56 flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50 p-8 text-center"><span className="grid size-12 place-items-center rounded-2xl bg-card text-red-500"><AlertCircle /></span><strong className="mt-4 text-red-700">Không thể tải dữ liệu</strong><span className="mt-1 text-sm text-red-600">{message}</span><button type="button" onClick={onRetry} className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white">Thử lại</button></div>;
}
