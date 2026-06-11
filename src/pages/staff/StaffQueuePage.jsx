import { Clock3, DollarSign, TimerReset, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppStore } from "../../state/AppStore";

const statusLabels = {
  CONFIRMED: "Đã xác nhận",
  CHECKED_IN: "Đã tiếp nhận",
  WASHING: "Đang rửa",
};

function StaffQueuePage() {
  const { state } = useAppStore();
  const queue = state.bookings.filter((item) =>
    ["CONFIRMED", "CHECKED_IN", "WASHING"].includes(item.bookingStatus),
  );
  const active =
    queue.find((item) => item.bookingStatus === "WASHING") || queue[0];
  const revenue = state.bookings
    .filter((item) => item.paymentStatus === "PAID")
    .reduce((sum, item) => sum + item.finalAmount, 0);

  const metrics = [
    [UsersRound, "Xe trong hàng đợi", queue.length],
    [TimerReset, "Thời gian rửa trung bình", "22 phút"],
    [
      DollarSign,
      "Doanh thu đã thanh toán",
      `${new Intl.NumberFormat("vi-VN").format(revenue)} đ`,
    ],
  ];

  return (
    <div className="space-y-5">
      {active && (
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex justify-between">
            <div>
              <span className="text-[9px] font-bold text-blue-600">
                KHOANG 01 · ĐANG HOẠT ĐỘNG
              </span>
              <h1 className="mt-2 text-xl font-extrabold">{active.vehicle}</h1>
              <p className="mt-1 text-[10px] text-slate-500">
                {active.serviceName}
              </p>
            </div>
            <strong className="text-sm text-blue-600">
              {active.bookingStatus === "WASHING" ? "78%" : "Sẵn sàng"}
            </strong>
          </div>
          <div className="mt-5 h-2 rounded-full bg-blue-100">
            <div
              className={`h-full rounded-full bg-blue-600 ${
                active.bookingStatus === "WASHING" ? "w-4/5" : "w-1/4"
              }`}
            />
          </div>
          <Link
            to={`/staff/bookings/${active.id}/workflow`}
            className="mt-5 block rounded-lg bg-blue-600 py-3 text-center text-xs font-bold text-white"
          >
            Mở quy trình đang hoạt động
          </Link>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        {metrics.map(([Icon, label, value]) => (
          <article
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-50 text-blue-600">
              <Icon size={17} />
            </span>
            <p className="mt-3 text-[10px] text-slate-500">{label}</p>
            <strong className="mt-1 block text-2xl">{value}</strong>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="p-5">
          <h2 className="font-extrabold">Hàng đợi dịch vụ</h2>
          <p className="mt-1 text-[10px] text-slate-500">
            Các lịch đặt đủ điều kiện xử lý tại cơ sở.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-[10px]">
            <thead className="bg-slate-50 text-[8px] uppercase text-slate-500">
              <tr>
                <th className="p-4">Thời gian</th>
                <th className="p-4">Khách hàng</th>
                <th className="p-4">Phương tiện</th>
                <th className="p-4">Gói dịch vụ</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queue.map((item) => (
                <tr key={item.id}>
                  <td className="p-4">
                    <Clock3 size={13} className="mb-1" />
                    {item.slotTime}
                  </td>
                  <td className="p-4 font-semibold">{item.customerName}</td>
                  <td className="p-4">
                    {item.vehicle}
                    <span className="block text-[8px] text-slate-400">
                      {item.plate}
                    </span>
                  </td>
                  <td className="p-4">{item.serviceName}</td>
                  <td className="p-4 font-bold text-blue-600">
                    {statusLabels[item.bookingStatus] || item.bookingStatus}
                  </td>
                  <td className="p-4">
                    <Link
                      className="font-bold text-blue-600"
                      to={`/staff/bookings/${item.id}/workflow`}
                    >
                      Xử lý
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default StaffQueuePage;
