import {
  CalendarCheck,
  CircleDollarSign,
  Car,
  Users,
  Droplets,
  Clock,
} from "lucide-react";

const bookings = [
  {
    id: 1,
    customer: "Nguyễn Văn An",
    vehicle: "Toyota Vios",
    packageName: "Tiêu chuẩn",
    status: "WASHING",
    payment: "PAID",
    amount: 180000,
    progress: 72,
  },
  {
    id: 2,
    customer: "Lê Thị Bình",
    vehicle: "Honda CR-V",
    packageName: "Cao cấp",
    status: "CHECKED_IN",
    payment: "PAID",
    amount: 250000,
    progress: 34,
  },
  {
    id: 3,
    customer: "Phạm Quốc Cường",
    vehicle: "Ford Ranger",
    packageName: "Detailing",
    status: "CONFIRMED",
    payment: "PAID",
    amount: 420000,
    progress: 12,
  },
  {
    id: 4,
    customer: "Trần Minh Khoa",
    vehicle: "Mazda 3",
    packageName: "Tiêu chuẩn",
    status: "COMPLETED",
    payment: "PAID",
    amount: 160000,
    progress: 100,
  },
];

const slotBoard = [
  { time: "08:00", capacity: 4, reserved: 4 },
  { time: "08:30", capacity: 4, reserved: 3 },
  { time: "09:00", capacity: 4, reserved: 2 },
  { time: "09:30", capacity: 4, reserved: 1 },
  { time: "10:00", capacity: 4, reserved: 4 },
  { time: "10:30", capacity: 4, reserved: 2 },
  { time: "11:00", capacity: 4, reserved: 0 },
  { time: "11:30", capacity: 4, reserved: 1 },
];

const revenueData = [
  { day: "T2", value: 3200000 },
  { day: "T3", value: 2800000 },
  { day: "T4", value: 3600000 },
  { day: "T5", value: 4100000 },
  { day: "T6", value: 5200000 },
  { day: "T7", value: 8000000 },
  { day: "CN", value: 6900000 },
];

function formatVnd(value) {
  return new Intl.NumberFormat("vi-VN").format(value) + " đ";
}

function StatCard({
  label,
  value,
  delta,
  hint,
  icon: Icon,
  deltaPositive = true,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>

          {delta && (
            <p
              className={`mt-3 text-sm font-semibold ${
                deltaPositive ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {delta}{" "}
              {hint && (
                <span className="font-normal text-slate-500">{hint}</span>
              )}
            </p>
          )}
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-slate-900">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function Progress({ value }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-blue-600"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function BookingStatusBadge({ status }) {
  const labelMap = {
    CONFIRMED: "Đã xác nhận",
    CHECKED_IN: "Đã check-in",
    WASHING: "Đang rửa",
    COMPLETED: "Hoàn tất",
  };

  const colorMap = {
    CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
    CHECKED_IN: "bg-cyan-50 text-cyan-700 border-cyan-200",
    WASHING: "bg-indigo-50 text-indigo-700 border-indigo-200",
    COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
        colorMap[status] || "bg-slate-50 text-slate-700 border-slate-200"
      }`}
    >
      {labelMap[status] || status}
    </span>
  );
}

function RevenueChart() {
  const maxValue = Math.max(...revenueData.map((item) => item.value));

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-slate-950">Doanh thu theo ngày</h2>
      <p className="mt-1 text-sm text-slate-500">7 ngày gần nhất</p>

      <div className="mt-6 flex h-72 items-end gap-4 border-b border-slate-200 px-4">
        {revenueData.map((item) => {
          const height = Math.round((item.value / maxValue) * 100);

          return (
            <div
              key={item.day}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div className="flex h-60 w-full items-end">
                <div
                  className="w-full rounded-t-lg bg-blue-600"
                  style={{ height: `${height}%` }}
                  title={formatVnd(item.value)}
                />
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {item.day}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function CustomerHomePage() {
  const activeBookings = bookings.filter((booking) =>
    ["CONFIRMED", "CHECKED_IN", "WASHING"].includes(booking.status),
  );

  const completedToday = bookings.filter(
    (booking) => booking.status === "COMPLETED",
  ).length;

  const revenueToday = bookings
    .filter((booking) => ["PAID", "ISSUED"].includes(booking.payment))
    .reduce((sum, booking) => sum + booking.amount, 0);

  const totalCapacity = slotBoard.reduce((sum, slot) => sum + slot.capacity, 0);
  const totalReserved = slotBoard.reduce((sum, slot) => sum + slot.reserved, 0);
  const occupancy = Math.round((totalReserved / totalCapacity) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          Tổng quan vận hành
        </h1>
        <p className="mt-2 text-slate-500">
          Theo dõi đặt lịch, công suất, doanh thu và tiến độ phục vụ theo thời
          gian thực.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Booking hôm nay"
          value={bookings.length.toString()}
          delta="+12%"
          hint="so với hôm qua"
          icon={CalendarCheck}
        />
        <StatCard
          label="Doanh thu hôm nay"
          value={formatVnd(revenueToday)}
          delta="+8.4%"
          hint="so với hôm qua"
          icon={CircleDollarSign}
        />
        <StatCard
          label="Đang phục vụ"
          value={activeBookings.length.toString()}
          delta={`${completedToday} đã hoàn tất`}
          icon={Droplets}
        />
        <StatCard
          label="Công suất khung giờ"
          value={`${occupancy}%`}
          delta="Giờ cao điểm 08:00 - 10:00"
          deltaPositive={occupancy < 80}
          icon={Users}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-slate-950">
            Hàng đợi đang phục vụ
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Tiến độ vòng đời dịch vụ
          </p>

          <div className="mt-6 space-y-5">
            {activeBookings.map((booking) => (
              <div key={booking.id} className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-slate-900">
                      <Car size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950">
                        {booking.customer}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {booking.vehicle} · {booking.packageName}
                      </p>
                    </div>
                  </div>

                  <BookingStatusBadge status={booking.status} />
                </div>

                <Progress value={booking.progress} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-slate-950">
          Công suất khung giờ hôm nay
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Số slot đã đặt trên tổng sức chứa mỗi khung giờ
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {slotBoard.map((slot) => {
            const ratio = slot.reserved / slot.capacity;
            const full = slot.reserved >= slot.capacity;

            return (
              <div
                key={slot.time}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">
                    {slot.time}
                  </span>
                  <Clock size={15} className="text-slate-400" />
                </div>

                <div className="mt-3">
                  <Progress value={ratio * 100} />
                </div>

                <p
                  className={`mt-2 text-xs font-medium ${
                    full ? "text-red-600" : "text-slate-500"
                  }`}
                >
                  {full
                    ? "Hết slot"
                    : `${slot.capacity - slot.reserved} slot trống`}
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

export default CustomerHomePage;
