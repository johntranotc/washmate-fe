import { Printer } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAppStore } from "../../state/AppStore";

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);
}

function InvoicePage() {
  const { bookingId } = useParams();
  const { state } = useAppStore();
  const booking = state.bookings.find((item) => item.id === Number(bookingId));

  if (!booking || booking.invoiceStatus === "NOT_ISSUED") {
    return (
      <div className="rounded-xl bg-white p-8">
        Hóa đơn chưa được phát hành.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-6 md:p-9">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-700">
            AquaSmart Pro
          </h1>
          <p className="mt-2 text-xs text-slate-500">{booking.garageName}</p>
        </div>
        <div className="sm:text-right">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-[9px] font-bold text-blue-700">
            ĐÃ PHÁT HÀNH
          </span>
          <h2 className="mt-3 font-extrabold">{booking.invoiceCode}</h2>
        </div>
      </div>

      <div className="grid gap-5 py-6 text-xs sm:grid-cols-2">
        <div>
          <span className="text-slate-400">Khách hàng</span>
          <b className="mt-1 block">{booking.customerName}</b>
        </div>
        <div>
          <span className="text-slate-400">Mã đặt lịch</span>
          <b className="mt-1 block">{booking.code}</b>
        </div>
        <div>
          <span className="text-slate-400">Phương tiện</span>
          <b className="mt-1 block">
            {booking.vehicle} • {booking.plate}
          </b>
        </div>
        <div>
          <span className="text-slate-400">Thời gian</span>
          <b className="mt-1 block">
            {booking.bookingDate} • {booking.slotTime}
          </b>
        </div>
      </div>

      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="p-3">Nội dung</th>
            <th className="p-3 text-right">Số tiền</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          <tr>
            <td className="p-3">{booking.serviceName}</td>
            <td className="p-3 text-right">{formatCurrency(booking.amount)}</td>
          </tr>
          <tr>
            <td className="p-3">Giảm giá</td>
            <td className="p-3 text-right text-blue-600">
              -{formatCurrency(booking.discount)}
            </td>
          </tr>
          <tr className="font-extrabold">
            <td className="p-3">Tổng thanh toán</td>
            <td className="p-3 text-right">
              {formatCurrency(booking.finalAmount)}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Link
          to={`/customer/bookings/${booking.id}`}
          className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold"
        >
          Chi tiết đặt lịch
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white"
        >
          <Printer size={14} /> In hóa đơn
        </button>
      </div>
    </div>
  );
}

export default InvoicePage;
