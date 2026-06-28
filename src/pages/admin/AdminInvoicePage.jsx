import { FileText } from "lucide-react";

export default function AdminInvoicePage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Quản trị WashMate</p>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Hóa đơn</h1>
        <p className="mt-1 text-sm text-slate-500">Danh sách hóa đơn phát hành từ hệ thống.</p>
      </header>
      <section className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
          <FileText size={32} className="text-slate-400" />
        </span>
        <div>
          <p className="font-semibold text-slate-700">Chưa có API lấy danh sách toàn bộ hóa đơn</p>
          <p className="mt-1 text-sm text-slate-400">
            Backend hiện tại chỉ hỗ trợ lấy chi tiết 1 hóa đơn (<code className="rounded bg-slate-100 px-1 py-0.5 text-xs">/api/invoices/{"{id}"}</code>), chưa có API phân trang danh sách hóa đơn cho Admin.
          </p>
        </div>
      </section>
    </div>
  );
}
