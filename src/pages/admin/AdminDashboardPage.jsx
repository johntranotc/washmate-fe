import { Building2, CalendarDays, CheckCircle2, CircleDollarSign, CreditCard, PackageCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api/adminApi";
import DemoDataNotice from "../../components/customer/DemoDataNotice";
import { adminMockData } from "../../mocks/adminMockData";

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState(adminMockData.summary);
  const [isMock, setIsMock] = useState(false);
  useEffect(() => { adminApi.getAdminSummary().then((data) => setSummary({ ...adminMockData.summary, ...data })).catch(() => setIsMock(true)); }, []);
  const metrics = [
    [Building2, "Tổng gara", summary.garages],
    [PackageCheck, "Dịch vụ đang mở", summary.activeServices],
    [CalendarDays, "Lịch hôm nay", summary.todayBookings],
    [CircleDollarSign, "Doanh thu", `${Number(summary.revenue).toLocaleString("vi-VN")}đ`],
    [CreditCard, "Thanh toán đã nhận", summary.paidPayments],
    [CheckCircle2, "Lịch hoàn tất", summary.completedBookings],
  ];
  return <div className="space-y-6"><header><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Quản trị WashMate</p><h1 className="mt-2 text-3xl font-extrabold">Tổng quan hệ thống</h1><p className="mt-2 text-sm text-slate-500">Theo dõi vận hành gara, booking và doanh thu trên một màn hình.</p></header>{isMock && <DemoDataNotice />}<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{metrics.map(([Icon,label,value]) => <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><Icon size={19}/></span><p className="mt-4 text-xs text-slate-500">{label}</p><b className="mt-1 block text-2xl">{value}</b></article>)}</section><section className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]"><article className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex justify-between"><h2 className="font-extrabold">Booking gần đây</h2><Link to="/admin/bookings" className="text-xs font-bold text-blue-600">Xem tất cả</Link></div><div className="mt-4 space-y-3">{adminMockData.bookings.map((item) => <div key={item.id} className="flex flex-col gap-2 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center"><div className="flex-1"><b className="text-sm">{item.code} · {item.customer}</b><p className="mt-1 text-xs text-slate-500">{item.garage} · {item.service}</p></div><span className="text-xs font-bold text-blue-600">{item.bookingStatus}</span></div>)}</div></article><article className="rounded-2xl bg-gradient-to-br from-blue-700 to-cyan-500 p-6 text-white"><h2 className="text-xl font-black">Hiệu suất dịch vụ</h2><p className="mt-2 text-xs leading-5 text-blue-100">Rửa xe cao cấp đang là gói được lựa chọn nhiều nhất trong tuần.</p><div className="mt-6 space-y-4">{[["Rửa xe cao cấp","42%"],["Chăm sóc toàn diện","31%"],["Rửa xe cơ bản","27%"]].map(([label,value]) => <div key={label} className="flex justify-between text-xs"><span>{label}</span><b>{value}</b></div>)}</div><Link to="/admin/reports" className="mt-7 block rounded-xl bg-white py-3 text-center text-xs font-bold text-blue-700">Xem báo cáo</Link></article></section></div>;
}
