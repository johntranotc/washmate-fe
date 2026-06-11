import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  DollarSign,
  UsersRound,
} from "lucide-react";
import { useAppStore } from "../../state/AppStore";

const metrics = [
  {
    label: "Tổng doanh thu",
    value: "142.850.000 đ",
    change: "+12.5%",
    positive: true,
    icon: DollarSign,
  },
  {
    label: "Tỷ lệ hoàn tất",
    value: "87.4%",
    change: "+4.2%",
    positive: true,
    icon: CalendarDays,
  },
  {
    label: "Khách hàng mới",
    value: "1,204",
    change: "-2.1%",
    positive: false,
    icon: UsersRound,
  },
  {
    label: "Thời gian dịch vụ trung bình",
    value: "24,5 phút",
    change: "-15m",
    positive: true,
    icon: Clock3,
  },
];

const garages = [
  ["Trung tâm Quận 1", "TP. Hồ Chí Minh", "42.300.000 đ", "4,9"],
  ["Trung tâm Thủ Đức", "TP. Hồ Chí Minh", "38.850.000 đ", "4,8"],
  ["Trung tâm Hải Châu", "Đà Nẵng", "35.900.000 đ", "4,7"],
];

function AdminDashboardPage() {
  const { state } = useAppStore();
  const paidBookings = state.bookings.filter(
    (item) => item.paymentStatus === "PAID",
  );
  const totalRevenue = paidBookings.reduce(
    (sum, item) => sum + item.finalAmount,
    0,
  );
  const completionRate = state.bookings.length
    ? Math.round(
        (state.bookings.filter((item) => item.bookingStatus === "COMPLETED")
          .length /
          state.bookings.length) *
          100,
      )
    : 0;
  const dynamicMetrics = [
    { ...metrics[0], value: new Intl.NumberFormat("vi-VN").format(totalRevenue) + " đ" },
    { ...metrics[1], value: `${completionRate}%` },
    { ...metrics[2], value: String(state.users.filter((user) => user.role === "CUSTOMER").length) },
    metrics[3],
  ];
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Tổng quan hiệu suất
        </h1>
        <p className="mt-2 text-[10px] text-slate-500">
          Dữ liệu thời gian thực từ tất cả cơ sở được kết nối.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dynamicMetrics.map((metric) => {
          const Icon = metric.icon;
          const Trend = metric.positive ? ArrowUpRight : ArrowDownRight;
          return (
            <article
              key={metric.label}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-start gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-md bg-blue-50 text-blue-600">
                  <Icon size={15} />
                </span>
                <div className="min-w-0">
                  <p className="text-[9px] text-slate-500">{metric.label}</p>
                  <strong className="mt-1 block text-base">
                    {metric.value}
                  </strong>
                </div>
                <span
                  className={`ml-auto flex items-center text-[8px] font-bold ${
                    metric.positive ? "text-emerald-600" : "text-rose-500"
                  }`}
                >
                  {metric.change} <Trend size={11} />
                </span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold">Xu hướng doanh thu</h2>
            <span className="rounded bg-slate-100 px-2 py-1 text-[8px] font-semibold text-slate-500">
              30 ngày gần nhất
            </span>
          </div>
          <div className="relative mt-5 h-64">
            <span className="absolute inset-x-0 top-1/4 border-t border-dashed border-slate-200" />
            <span className="absolute inset-x-0 top-1/2 border-t border-dashed border-slate-200" />
            <span className="absolute inset-x-0 top-3/4 border-t border-dashed border-slate-200" />
            <svg
              className="relative z-10 h-[220px] w-full"
              viewBox="0 0 600 220"
              preserveAspectRatio="none"
            >
              <path
                d="M0 175 C65 75 125 105 185 155 S285 205 345 75 S445 20 500 130 S560 205 600 45"
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="6"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-x-0 bottom-0 flex justify-between text-[8px] text-slate-400">
              <span>01/10</span>
              <span>10/10</span>
              <span>20/10</span>
              <span>30/10</span>
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-extrabold">Phân bố hạng thành viên</h2>
          <div className="relative mx-auto mt-5 grid h-44 w-44 place-items-center rounded-full bg-[conic-gradient(#073b5c_0_35%,#1167d7_35%_65%,#a9c5ff_65%)]">
            <div className="grid h-28 w-28 place-items-center rounded-full bg-white text-center">
              <div>
                <strong className="block text-xl">4.8k</strong>
                <span className="text-[8px] text-slate-400">Tổng cộng</span>
              </div>
            </div>
          </div>
          <div className="mt-5 space-y-3 text-[9px]">
            {[
              ["bg-[#073b5c]", "Vàng", "35%"],
              ["bg-blue-600", "Bạc", "30%"],
              ["bg-blue-200", "Đồng", "35%"],
            ].map(([color, label, value]) => (
              <div key={label} className="flex items-center">
                <span className={`mr-2 h-2 w-2 rounded-full ${color}`} />
                <span className="text-slate-500">{label}</span>
                <b className="ml-auto">{value}</b>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-extrabold">Khung giờ cao điểm</h2>
          <div className="mt-7 flex h-52 items-end gap-3">
            {[35, 55, 72, 100, 84, 61, 43].map((height, index) => (
              <div
                key={height}
                className="flex h-full flex-1 flex-col justify-end gap-2 text-center"
              >
                <span
                  className={`block min-h-2 ${
                    index === 3 || index === 4
                      ? "bg-blue-700"
                      : "bg-blue-200"
                  }`}
                  style={{ height: `${height}%` }}
                />
                <small className="text-[7px] text-slate-400">
                  {["8 giờ", "10 giờ", "12 giờ", "14 giờ", "16 giờ", "18 giờ", "20 giờ"][index]}
                </small>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold">
              Cơ sở hoạt động tốt nhất
            </h2>
            <button className="text-[8px] font-bold text-blue-600">
              Xem tất cả
            </button>
          </div>
          <div className="mt-5 space-y-3">
            {garages.map((garage) => (
              <div
                key={garage[0]}
                className="flex items-center gap-3 rounded-lg bg-slate-50 p-3"
              >
                <span className="grid h-9 w-9 place-items-center rounded-md bg-blue-100 text-sm text-blue-600">
                  ■
                </span>
                <div className="min-w-0 flex-1">
                  <b className="block truncate text-[10px]">{garage[0]}</b>
                  <span className="text-[8px] text-slate-400">{garage[1]}</span>
                </div>
                <div className="text-right">
                  <strong className="block text-[10px]">{garage[2]}</strong>
                  <span className="text-[8px] text-blue-500">
                    ★ {garage[3]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

export default AdminDashboardPage;

