import { useState } from "react";
import { useNavigate } from "react-router-dom";

const mockPayment = {
  bookingId: 1,
  bookingCode: "BK-0001",
  garageName: "AutoWash Garage Thủ Đức",
  vehicle: "51A-12345 - Toyota Vios",
  serviceName: "Premium Wash",
  bookingDate: "2026-06-06",
  slotTime: "09:00 - 09:30",
  totalAmount: 120000,
  discountAmount: 10000,
  finalAmount: 110000,
};

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

function getStatusLabel(status) {
  const labels = {
    PENDING: "PENDING - Chờ xử lý",
    PAID: "PAID - Đã thanh toán",
    CONFIRMED: "CONFIRMED - Đã xác nhận",
    NOT_ISSUED: "NOT_ISSUED - Chưa phát hành",
  };

  return labels[status] || status;
}

function getPaymentMethodLabel(method) {
  const labels = {
    CASH: "Tiền mặt",
    BANK_TRANSFER: "Chuyển khoản",
    CARD: "Thẻ ngân hàng",
  };

  return labels[method] || method;
}

function StatusBadge({ label, status }) {
  const statusClass =
    status === "PAID" || status === "CONFIRMED"
      ? "bg-green-100 text-green-700 border-green-200"
      : status === "NOT_ISSUED"
        ? "bg-slate-100 text-slate-700 border-slate-200"
        : "bg-amber-100 text-amber-700 border-amber-200";

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span
        className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass}`}
      >
        {getStatusLabel(status)}
      </span>
    </div>
  );
}

function PaymentPage() {
  const navigate = useNavigate();

  const [paymentStatus, setPaymentStatus] = useState("PENDING");
  const [bookingStatus, setBookingStatus] = useState("PENDING");
  const [invoiceStatus, setInvoiceStatus] = useState("NOT_ISSUED");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paidAt, setPaidAt] = useState("");
  const [transactionCode, setTransactionCode] = useState("");

  const isPaid = paymentStatus === "PAID";

  function handleMockMarkPaid() {
    const now = new Date();

    setPaymentStatus("PAID");
    setBookingStatus("CONFIRMED");
    setInvoiceStatus("PAID");
    setPaidAt(now.toLocaleString("vi-VN"));
    setTransactionCode(`TXN-${now.getTime()}`);
  }

  function goToInvoice() {
    navigate(`/customer/bookings/${mockPayment.bookingId}/invoice`);
  }

  function goToBookingDetail() {
    navigate(`/customer/bookings/${mockPayment.bookingId}`);
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Trang thanh toán</h1>
        <p className="mt-2 text-slate-500">
          Thanh toán booking. Chỉ khi Payment PAID thì Booking mới CONFIRMED.
        </p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-800">
        <strong>Quy tắc nghiệp vụ:</strong> Payment PAID là điều kiện để booking
        chuyển từ PENDING sang CONFIRMED.
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-center text-xl font-bold text-slate-900">
              Thông tin đặt lịch
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-5 text-center md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Mã đặt lịch</p>
                <p className="font-bold text-slate-900">
                  {mockPayment.bookingCode}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Cửa hàng</p>
                <p className="font-bold text-slate-900">
                  {mockPayment.garageName}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Phương tiện</p>
                <p className="font-bold text-slate-900">
                  {mockPayment.vehicle}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Gói dịch vụ</p>
                <p className="font-bold text-slate-900">
                  {mockPayment.serviceName}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Ngày đặt lịch</p>
                <p className="font-bold text-slate-900">
                  {mockPayment.bookingDate}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Khung giờ</p>
                <p className="font-bold text-slate-900">
                  {mockPayment.slotTime}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-center text-xl font-bold text-slate-900">
              Phương thức thanh toán
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
              {["CASH", "BANK_TRANSFER", "CARD"].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  disabled={isPaid}
                  className={`rounded-xl border px-4 py-3 font-semibold transition ${
                    paymentMethod === method
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {getPaymentMethodLabel(method)}
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-500">Phương thức đã chọn</p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {getPaymentMethodLabel(paymentMethod)}
              </p>
            </div>

            {!isPaid && (
              <button
                type="button"
                onClick={handleMockMarkPaid}
                className="mt-6 w-full rounded-lg bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800"
              >
                Xác nhận thanh toán thành công
              </button>
            )}

            {isPaid && (
              <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
                <h3 className="font-bold text-green-800">
                  Thanh toán thành công
                </h3>
                <p className="mt-1 text-sm text-green-700">
                  Payment đã PAID, Booking đã chuyển sang CONFIRMED và Invoice
                  đã PAID.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-green-700">Mã giao dịch</p>
                    <p className="font-bold text-green-900">
                      {transactionCode}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-green-700">
                      Thời điểm thanh toán
                    </p>
                    <p className="font-bold text-green-900">{paidAt}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-center text-xl font-bold text-slate-900">
              Tóm tắt thanh toán
            </h2>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Tạm tính</span>
                <span className="font-medium">
                  {formatCurrency(mockPayment.totalAmount)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Giảm giá</span>
                <span className="font-medium text-green-600">
                  -{formatCurrency(mockPayment.discountAmount)}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <div className="flex justify-between text-lg font-bold text-slate-900">
                  <span>Cần thanh toán</span>
                  <span>{formatCurrency(mockPayment.finalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <StatusBadge label="Trạng thái đặt lịch" status={bookingStatus} />
            <StatusBadge label="Trạng thái thanh toán" status={paymentStatus} />
            <StatusBadge label="Trạng thái hóa đơn" status={invoiceStatus} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Hành động tiếp theo
            </h2>

            {!isPaid ? (
              <p className="mt-3 text-sm text-slate-500">
                Booking hiện vẫn PENDING. Hãy xác nhận payment để booking được
                CONFIRMED.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={goToInvoice}
                  className="w-full rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800"
                >
                  Xem hóa đơn
                </button>

                <button
                  type="button"
                  onClick={goToBookingDetail}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Xem chi tiết đặt lịch
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default PaymentPage;
