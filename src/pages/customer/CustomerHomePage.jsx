import {
  ArrowRight,
  CalendarDays,
  Check,
  CircleAlert,
  Info,
  MapPin,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";

const vehicles = [
  {
    name: "Tesla Model 3",
    plate: "AQ-FLOW-01",
    image:
      "https://images.unsplash.com/photo-1617788131775-16a213582423?auto=format&fit=crop&w=700&q=85",
    note: "Lần rửa gần nhất: 4 ngày trước",
    primary: true,
  },
  {
    name: "Porsche Cayenne",
    plate: "K-SPORT-22",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=700&q=85",
    note: "Lần rửa gần nhất: 12 ngày trước",
  },
  {
    name: "Range Rover",
    plate: "LUX-V-09",
    image:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=700&q=85",
    note: "Cần chú ý",
    alert: true,
  },
];

function CustomerHomePage() {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[22px] bg-[#071e32] px-7 py-9 text-white shadow-sm md:px-11 md:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(255,255,255,.16)_0_2px,transparent_3px),radial-gradient(circle_at_64%_76%,rgba(255,255,255,.12)_0_5px,transparent_6px)] opacity-70" />
        <div className="absolute -bottom-32 right-16 h-64 w-96 rounded-full border-[45px] border-white/[0.025] bg-blue-500/10" />

        <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full bg-white px-3 py-1 text-[9px] font-extrabold text-blue-700">
              THÀNH VIÊN VÀNG
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] md:text-5xl">
              Chào mừng trở lại, Alex!
            </h1>
            <p className="mt-3 text-sm leading-6 text-blue-100">
              Sẵn sàng giúp chiếc xe của bạn sáng bóng trở lại? Lần rửa xe cao
              cấp tiếp theo được <strong className="text-white">giảm 20%.</strong>
            </p>
          </div>

          <Link
            to="/customer/bookings/create"
            className="flex min-h-20 min-w-48 items-center justify-between gap-5 rounded-2xl bg-blue-600 px-7 text-lg font-extrabold shadow-lg shadow-blue-950/20 transition hover:bg-blue-500"
          >
            Đặt lịch nhanh <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-blue-700">
              Tổng quan điểm thưởng
            </h2>
            <Info size={17} className="text-blue-600" />
          </div>
          <p className="mt-7 text-[10px] font-medium text-slate-500">
            Điểm hiện có
          </p>
          <p className="mt-1 text-4xl font-bold tracking-tight">
            1.250 <span className="text-xs text-slate-500">điểm</span>
          </p>
          <div className="mt-6 flex justify-between text-[9px] font-semibold">
            <span className="text-slate-500">Hạng tiếp theo: Bạch kim</span>
            <span className="text-blue-600">250 điểm nữa</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-blue-100">
            <div className="h-full w-4/5 rounded-full bg-blue-600" />
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold">Lịch đặt đang hoạt động</h2>
            <Link
              to="/customer/bookings"
              className="text-[10px] font-bold text-blue-600"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="mt-5 flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center">
            <img
              src={vehicles[0].image}
              alt="Tesla Model 3"
              className="h-20 w-full rounded-lg object-cover sm:w-28"
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold">Tesla Model 3</h3>
              <p className="mt-2 flex items-center gap-2 text-[10px] text-slate-600">
                <CalendarDays size={13} /> Hôm nay, 14:00
              </p>
              <p className="mt-2 flex items-center gap-2 text-[10px] text-slate-600">
                <MapPin size={13} /> Downtown Hub
              </p>
            </div>
            <div className="self-start text-right">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-[9px] font-bold text-blue-700">
                <Check size={11} /> Đã xác nhận
              </span>
              <p className="mt-2 text-[8px] text-slate-400">Có thể đổi lịch</p>
            </div>
          </div>
        </article>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">Phương tiện của tôi</h2>
          <Link
            to="/customer/vehicles"
            className="flex items-center gap-1 text-[10px] font-bold text-blue-600"
          >
            <Plus size={14} /> Thêm phương tiện
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {vehicles.map((vehicle) => (
            <article
              key={vehicle.plate}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="relative overflow-hidden rounded-xl">
                {vehicle.primary && (
                  <span className="absolute right-2 top-2 z-10 rounded bg-blue-600 px-2 py-1 text-[8px] font-extrabold text-white">
                    PRIMARY
                  </span>
                )}
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="h-32 w-full object-cover"
                />
              </div>
              <h3 className="mt-4 text-base font-extrabold">{vehicle.name}</h3>
              <p className="mt-1 text-[9px] text-slate-500">
                Plate: {vehicle.plate}
              </p>
              <div
                className={`mt-5 flex items-center justify-between text-[9px] font-semibold ${
                  vehicle.alert ? "text-rose-600" : "text-slate-500"
                }`}
              >
                {vehicle.note}
                {vehicle.alert ? (
                  <CircleAlert size={16} />
                ) : (
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-blue-600 text-white">
                    <Check size={10} />
                  </span>
                )}
              </div>
            </article>
          ))}

          <Link
            to="/customer/vehicles"
            className="flex min-h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 px-7 text-center transition hover:border-blue-400 hover:bg-blue-50/40"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-slate-900">
              <Plus size={18} />
            </span>
            <strong className="mt-4 text-base">Thêm phương tiện</strong>
            <span className="mt-2 text-[9px] leading-4 text-slate-500">
              Đăng ký xe mới để đặt lịch nhanh chóng.
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default CustomerHomePage;

