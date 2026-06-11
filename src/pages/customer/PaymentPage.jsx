import { CheckCircle2, CreditCard, Landmark, Wallet } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAppStore } from "../../state/AppStore";

const methods = [
  ["CASH", "Tiền mặt", Wallet],
  ["BANK_TRANSFER", "Chuyển khoản", Landmark],
  ["CARD", "Thẻ ngân hàng", CreditCard],
];

function money(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);
}

function PaymentPage() {
  const { bookingId } = useParams();
  const { state, actions } = useAppStore();
  const booking = state.bookings.find((item) => item.id === Number(bookingId));
  const [method, setMethod] = useState(booking?.paymentMethod || "CARD");

  if (!booking) {
    return <div className="rounded-xl bg-white p-8">Không tìm thấy lịch đặt.</div>;
  }

  const paid = booking.paymentStatus === "PAID";

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-extrabold">Thanh toán</h1>
        <p className="mt-2 text-xs text-slate-500">
          Thanh toán thành công sẽ tự động xác nhận lịch và phát hành hóa đơn.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-extrabold">Chọn phương thức thanh toán</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {methods.map(([value, label, Icon]) => (
              <button
                key={value}
                disabled={paid}
                onClick={() => setMethod(value)}
                className={`rounded-xl border p-4 text-left ${
                  method === value
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-200"
                }`}
              >
                <Icon size={20} />
                <b className="mt-3 block text-xs">{label}</b>
              </button>
            ))}
          </div>

          {!paid ? (
            <button
              onClick={() => actions.payBooking(booking.id, method)}
              className="mt-6 h-11 w-full rounded-lg bg-blue-600 text-sm font-bold text-white hover:bg-blue-700"
            >
              Xác nhận thanh toán
            </button>
          ) : (
            <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5 text-blue-700">
              <p className="flex items-center gap-2 text-sm font-bold">
                <CheckCircle2 size={18} /> Thanh toán thành công
              </p>
              <p className="mt-2 text-[10px]">
                Mã giao dịch: {booking.transactionCode}
              </p>
            </div>
          )}
        </section>

        <aside className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-extrabold">Tóm tắt đặt lịch</h2>
          <dl className="mt-5 space-y-4 text-xs">
            <div><dt className="text-slate-400">Mã lịch đặt</dt><dd className="mt-1 font-bold">{booking.code}</dd></div>
            <div><dt className="text-slate-400">Phương tiện</dt><dd className="mt-1 font-bold">{booking.vehicle} · {booking.plate}</dd></div>
            <div><dt className="text-slate-400">Dịch vụ</dt><dd className="mt-1 font-bold">{booking.serviceName}</dd></div>
            <div><dt className="text-slate-400">Lịch hẹn</dt><dd className="mt-1 font-bold">{booking.bookingDate} · {booking.slotTime}</dd></div>
          </dl>
          <div className="mt-5 flex justify-between border-t border-slate-200 pt-5">
            <b>Tổng cộng</b><strong className="text-blue-600">{money(booking.finalAmount)}</strong>
          </div>
          {paid && (
            <div className="mt-5 space-y-2">
              <Link className="block rounded-lg bg-blue-600 py-3 text-center text-xs font-bold text-white" to={`/customer/bookings/${booking.id}/invoice`}>Xem hóa đơn</Link>
              <Link className="block rounded-lg border border-slate-200 py-3 text-center text-xs font-bold" to={`/customer/bookings/${booking.id}`}>Chi tiết đặt lịch</Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default PaymentPage;

