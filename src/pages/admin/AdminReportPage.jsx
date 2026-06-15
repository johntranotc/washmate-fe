import { BadgeCheck, Building2, CalendarCheck2, CircleDollarSign, CreditCard, Star } from "lucide-react";
import DemoDataNotice from "../../components/customer/DemoDataNotice";
import { adminMockData } from "../../mocks/adminMockData";

export default function AdminReportPage() {
  const cards = [
    [CircleDollarSign, "Doanh thu tháng", "142.850.000đ", "Tăng 12,5% so với tháng trước"],
    [CalendarCheck2, "Booking hoàn tất", "87,4%", "18/24 lịch hôm nay"],
    [Star, "Dịch vụ phổ biến", "Rửa xe cao cấp", "Chiếm 42% lượt đặt"],
    [Building2, "Gara nổi bật", "WashMate Quận 1", "Đánh giá trung bình 4,9"],
    [CreditCard, "Tỷ lệ thanh toán", "91,6%", "21 giao dịch đã nhận"],
    [BadgeCheck, "Hiệu suất vận hành", "Tốt", "Thời gian trung bình 31 phút"],
  ];
  return <div className="space-y-6"><header><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Báo cáo cơ bản</p><h1 className="mt-2 text-3xl font-extrabold">Hiệu suất hệ thống</h1><p className="mt-2 text-sm text-slate-500">Tổng hợp nhanh hoạt động kinh doanh và vận hành.</p></header><DemoDataNotice /><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{cards.map(([Icon,label,value,note]) => <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5"><Icon className="text-blue-600" size={21}/><p className="mt-4 text-xs text-slate-500">{label}</p><b className="mt-1 block text-xl">{value}</b><p className="mt-2 text-[11px] text-slate-400">{note}</p></article>)}</section><section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="font-extrabold">Phân bố trạng thái booking</h2><div className="mt-5 space-y-4">{[["Hoàn tất",75],["Đang xử lý",17],["Không đến / Đã hủy",8]].map(([label,value]) => <div key={label}><div className="flex justify-between text-xs"><span>{label}</span><b>{value}%</b></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{width:`${value}%`}}/></div></div>)}</div></section><span className="hidden">{adminMockData.summary.garages}</span></div>;
}
